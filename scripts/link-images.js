#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const STRAPI_URL = 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN;
const IMAGES_PATH = '/Users/soul/Desktop/PROJECTS/drawing-master-v2/frontend/public';

function uploadFile(filePath) {
  const fullPath = `${IMAGES_PATH}/${filePath}`;
  try {
    const result = execSync(
      `curl -s -X POST "${STRAPI_URL}/api/upload" -H "Authorization: Bearer ${TOKEN}" -F "files=@${fullPath}"`,
      { encoding: 'utf8' }
    );
    const match = result.match(/"id":(\d+)/);
    return match ? match[1] : null;
  } catch (e) {
    console.error(`  Failed: ${e.message}`);
    return null;
  }
}

function updateEntry(endpoint, docId, imageId) {
  try {
    execSync(
      `curl -s -X PUT "${STRAPI_URL}/api${endpoint}/${docId}" -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" -d '{"data":{"image":${imageId}}}'`,
      { encoding: 'utf8' }
    );
    return true;
  } catch (e) {
    return false;
  }
}

function getEntries(endpoint) {
  try {
    const result = execSync(
      `curl -s "${STRAPI_URL}/api${endpoint}" -H "Authorization: Bearer ${TOKEN}"`,
      { encoding: 'utf8' }
    );
    return JSON.parse(result).data || [];
  } catch (e) {
    return [];
  }
}

const eventImages = {
  'Wine Painting Class': 'assets/img/WP.JPG',
  'Spirit Island in Watercolor': 'assets/img/SI.PNG',
  'Sunset Glow Acrylic Class': 'assets/img/SG.PNG',
  'Quiet Moment Acrylic Class': 'assets/img/QM.PNG',
  'Edge of Summer Acrylic Class': 'assets/img/DR.PNG',
  'Acrylic Peyto Lake Landscape': 'assets/img/PL.PNG',
  'Frost and Sun in Watercolor': 'assets/img/FS.PNG',
  'Your Pet Acrylic Portrait': 'assets/img/PP.JPG',
  'Citrus Therapy Acrylic Class': 'assets/img/mnd.PNG',
  'Into the Rockies Acrylic Class': 'assets/img/IMG_1695.PNG',
  'Winter on Fire Acrylic Class': 'assets/img/IMG_1677.PNG',
  'Beyond Today Acrylic Class': 'assets/img/IMG_1673.PNG',
  'Silent Light Acrylic Class': 'assets/img/IMG_1680.PNG',
  'February Watercolor Class': 'assets/img/IMG_1724.PNG',
  'Echoes of Flame Acrylic Class': 'assets/img/IMG_1692.PNG',
  'Awaiting Spring Acrylic Class': 'assets/img/IMG_1694.PNG',
  'Regular Art Classes for Adults': 'assets/img/photo.webp',
  'Private Art Classes': 'assets/img/adults.JPG',
};

const artworkImages = {
  'Student Artwork 1': 'assets/img/gallery/student_artwork/IMG_1819.webp',
  'Student Artwork 2': 'assets/img/gallery/student_artwork/IMG_1014.webp',
  'Student Artwork 3': 'assets/img/gallery/student_artwork/IMG_0552.webp',
  'Student Artwork 4': 'assets/img/gallery/student_artwork/IMG_3963.webp',
  'Instructor Artwork 1': 'assets/img/gallery/my_artwork/IMG_1469.webp',
  'Instructor Artwork 2': 'assets/img/gallery/my_artwork/IMG_7640.webp',
  'Instructor Artwork 3': 'assets/img/gallery/my_artwork/IMG_5363.webp',
  'Instructor Artwork 4': 'assets/img/gallery/my_artwork/IMG_3931.webp',
};

async function main() {
  console.log('Linking images to content...\n');

  // Events
  console.log('1. Processing Events...');
  const events = getEntries('/events');
  console.log(`   Found ${events.length} events`);

  for (const event of events) {
    const imagePath = eventImages[event.title];
    if (imagePath) {
      process.stdout.write(`   ${event.title}... `);
      const imageId = uploadFile(imagePath);
      if (imageId) {
        updateEntry('/events', event.documentId, imageId);
        console.log(`OK (ID: ${imageId})`);
      } else {
        console.log('FAILED');
      }
    }
  }

  // Artworks
  console.log('\n2. Processing Artworks...');
  const artworks = getEntries('/artworks');
  console.log(`   Found ${artworks.length} artworks`);

  for (const artwork of artworks) {
    const imagePath = artworkImages[artwork.title];
    if (imagePath) {
      process.stdout.write(`   ${artwork.title}... `);
      const imageId = uploadFile(imagePath);
      if (imageId) {
        updateEntry('/artworks', artwork.documentId, imageId);
        console.log(`OK (ID: ${imageId})`);
      } else {
        console.log('FAILED');
      }
    }
  }

  console.log('\nDone! Check http://localhost:1337/admin');
}

main();
