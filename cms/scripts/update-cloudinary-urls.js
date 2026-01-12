const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function updateUrls() {
  // This script must be run within Strapi context
  const strapi = require('@strapi/strapi');
  const app = await strapi().load();

  const files = await app.db.query('plugin::upload.file').findMany({});
  console.log(`Found ${files.length} files in database\n`);

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    // Skip if already on Cloudinary
    if (file.url && file.url.includes('cloudinary.com')) {
      console.log(`⊘ ${file.name} - already on Cloudinary`);
      skipped++;
      continue;
    }

    try {
      // Build Cloudinary URL
      const ext = file.ext || '';
      const publicId = `strapi-uploads/${file.hash}`;

      const cloudinaryUrl = cloudinary.url(publicId, {
        secure: true,
        resource_type: file.mime?.startsWith('video/') ? 'video' : 'image',
      });

      // Update in database
      await app.db.query('plugin::upload.file').update({
        where: { id: file.id },
        data: {
          url: cloudinaryUrl,
          provider: 'cloudinary',
        },
      });

      console.log(`✓ ${file.name} → updated`);
      updated++;
    } catch (error) {
      console.error(`✗ ${file.name}: ${error.message}`);
    }
  }

  console.log(`\n=== URL Update Complete ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  await app.destroy();
}

updateUrls().catch(console.error);
