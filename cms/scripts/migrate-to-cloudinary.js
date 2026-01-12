const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function migrateToCloudinary() {
  const uploadsDir = path.join(__dirname, '../public/uploads');

  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found at:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  console.log(`Found ${files.length} files to migrate\n`);

  const results = { success: 0, failed: 0 };

  for (const filename of files) {
    const filePath = path.join(uploadsDir, filename);
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) continue;

    try {
      const ext = path.extname(filename).toLowerCase();
      const resourceType = ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' :
                          ['.pdf', '.doc', '.docx'].includes(ext) ? 'raw' : 'image';

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        public_id: path.basename(filename, ext),
        folder: 'strapi-uploads',
        overwrite: true,
      });

      console.log(`✓ ${filename} → ${result.secure_url}`);
      results.success++;
    } catch (error) {
      console.error(`✗ ${filename}: ${error.message}`);
      results.failed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed: ${results.failed}`);

  if (results.success > 0) {
    console.log('\n⚠️  Now you need to update URLs in database.');
    console.log('Run: node scripts/update-cloudinary-urls.js');
  }
}

migrateToCloudinary().catch(console.error);
