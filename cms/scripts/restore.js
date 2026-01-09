const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';
const BACKUP_PATH = process.argv[2]; // Pass backup folder as argument

if (!BACKUP_PATH) {
  console.error('Usage: node restore.js <backup-folder-path>');
  console.error('Example: node restore.js ./backups/2024-01-08T12-00-00');
  process.exit(1);
}

if (!API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  console.error('Create a full-access API token in Strapi Admin > Settings > API Tokens');
  process.exit(1);
}

// Content types restore order (dependencies first)
const RESTORE_ORDER = [
  'settings',
  'homepage',
  'faqs',
  'events',
  'artworks',
  'leads',
];

async function uploadMedia(filePath) {
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filePath));

  try {
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(`Failed to upload ${path.basename(filePath)}`);
      return null;
    }

    const data = await response.json();
    return data[0]; // Return first uploaded file info
  } catch (error) {
    console.error(`Error uploading ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

async function createEntry(contentType, data) {
  // Remove Strapi internal fields
  const cleanData = { ...data };
  delete cleanData.id;
  delete cleanData.documentId;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  delete cleanData.publishedAt;
  delete cleanData.locale;

  // Handle media fields - they need special treatment
  // For now, we'll skip media relations and handle them separately
  for (const [key, value] of Object.entries(cleanData)) {
    if (value && typeof value === 'object') {
      if (value.url && value.url.includes('/uploads/')) {
        // This is a media field, skip for now
        delete cleanData[key];
      }
      if (Array.isArray(value) && value[0]?.url?.includes('/uploads/')) {
        delete cleanData[key];
      }
    }
  }

  try {
    const response = await fetch(`${STRAPI_URL}/api/${contentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ data: cleanData }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to create ${contentType} entry:`, error);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Error creating ${contentType}:`, error.message);
    return null;
  }
}

async function restore() {
  console.log('=== Strapi Restore Script ===\n');
  console.log(`Target: ${STRAPI_URL}`);
  console.log(`Backup: ${BACKUP_PATH}\n`);

  // Check backup exists
  const dataPath = path.join(BACKUP_PATH, 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`Backup data not found: ${dataPath}`);
    process.exit(1);
  }

  // Load backup data
  const backupData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Upload media files first
  const uploadsDir = path.join(BACKUP_PATH, 'uploads');
  const mediaMapping = {}; // old filename -> new upload info

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`Uploading ${files.length} media files...`);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      console.log(`  Uploading ${file}...`);
      const uploaded = await uploadMedia(filePath);
      if (uploaded) {
        mediaMapping[file] = uploaded;
        console.log(`  ✓ ${file} -> ${uploaded.id}`);
      }
    }
    console.log('');
  }

  // Restore content types
  for (const contentType of RESTORE_ORDER) {
    if (!backupData[contentType]) {
      console.log(`Skipping ${contentType}: no data`);
      continue;
    }

    const items = backupData[contentType].data;
    if (!items) {
      console.log(`Skipping ${contentType}: no items`);
      continue;
    }

    const itemsArray = Array.isArray(items) ? items : [items];
    console.log(`Restoring ${contentType} (${itemsArray.length} items)...`);

    for (const item of itemsArray) {
      const created = await createEntry(contentType, item);
      if (created) {
        console.log(`  ✓ Created ${contentType} #${created.id}`);
      } else {
        console.log(`  ✗ Failed to create ${contentType} entry`);
      }
    }
  }

  console.log('\n=== Restore complete! ===');
  console.log('Note: Media relations may need to be re-linked manually in Strapi Admin');
}

// Run restore
restore().catch(console.error);
