/**
 * Migrate local files to Cloudinary and update database URLs
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function migrate() {
  console.log('=== Migrate to Cloudinary ===\n');

  // Check Cloudinary config
  if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
    console.error('Error: Missing Cloudinary environment variables');
    process.exit(1);
  }

  console.log(`Cloudinary: ${process.env.CLOUDINARY_NAME}\n`);

  // Load Strapi
  console.log('Loading Strapi...');
  const { createStrapi } = require('@strapi/strapi');
  const strapi = await createStrapi({ distDir: './dist' }).load();
  console.log('Strapi loaded.\n');

  // Get all files from database
  const files = await strapi.db.query('plugin::upload.file').findMany({});
  console.log(`Found ${files.length} files in database\n`);

  const uploadsDir = path.join(__dirname, '../public/uploads');
  const results = { uploaded: 0, updated: 0, skipped: 0, failed: 0 };

  for (const file of files) {
    // Skip if already on Cloudinary
    if (file.url && file.url.includes('cloudinary.com')) {
      console.log(`⊘ ${file.name} - already on Cloudinary`);
      results.skipped++;
      continue;
    }

    const localPath = path.join(uploadsDir, file.hash + file.ext);

    if (!fs.existsSync(localPath)) {
      console.log(`⊘ ${file.name} - file not found: ${file.hash}${file.ext}`);
      results.skipped++;
      continue;
    }

    try {
      // Determine resource type
      const resourceType = file.mime?.startsWith('video/') ? 'video' :
                          file.mime?.startsWith('application/') ? 'raw' : 'image';

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localPath, {
        resource_type: resourceType,
        public_id: file.hash,
        folder: 'strapi',
        overwrite: true,
      });

      results.uploaded++;

      // Update database
      await strapi.db.query('plugin::upload.file').update({
        where: { id: file.id },
        data: {
          url: uploadResult.secure_url,
          provider: 'cloudinary',
          provider_metadata: {
            public_id: uploadResult.public_id,
            resource_type: uploadResult.resource_type,
          },
        },
      });

      console.log(`✓ ${file.name}`);
      results.updated++;

    } catch (error) {
      console.error(`✗ ${file.name}: ${error.message}`);
      results.failed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Uploaded to Cloudinary: ${results.uploaded}`);
  console.log(`Updated in database: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);

  await strapi.destroy();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
