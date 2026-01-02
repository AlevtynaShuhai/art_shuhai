#!/usr/bin/env node

/**
 * Upload images to existing Strapi content
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const IMAGES_PATH = path.join(__dirname, '..', 'frontend', 'public');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN is not set');
  process.exit(1);
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

async function uploadFile(filePath) {
  const fullPath = path.join(IMAGES_PATH, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`  File not found: ${fullPath}`);
    return null;
  }

  const form = new FormData();
  const fileBuffer = fs.readFileSync(fullPath);
  const name = path.basename(filePath);

  form.append('files', fileBuffer, {
    filename: name,
    contentType: getContentType(name),
  });

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const error = await response.text();
    console.warn(`  Upload failed: ${error}`);
    return null;
  }

  const result = await response.json();
  console.log(`  Uploaded: ${name} (ID: ${result[0].id})`);
  return result[0];
}

async function strapiRequest(endpoint, options = {}) {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

async function updateEntry(endpoint, id, data) {
  return strapiRequest(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// Image mappings
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

async function run() {
  console.log('Starting image upload...\n');

  // 1. Upload Settings images
  console.log('1. Uploading Settings images...');
  const logoDesktop = await uploadFile('assets/img/logo-art.svg');
  const logoMobile = await uploadFile('assets/img/logo-art-mb.svg');

  if (logoDesktop || logoMobile) {
    const settingsData = {};
    if (logoDesktop) settingsData.logoDesktop = logoDesktop.id;
    if (logoMobile) settingsData.logoMobile = logoMobile.id;

    await strapiRequest('/setting', {
      method: 'PUT',
      body: JSON.stringify({ data: settingsData }),
    });
    console.log('  Settings updated!\n');
  }

  // 2. Upload Homepage images
  console.log('2. Uploading Homepage images...');
  const bannerDesktop = await uploadFile('assets/img/bg-main-banner.webp');
  const bannerMobile = await uploadFile('assets/img/bg-mobile-banner.webp');
  const aboutImage = await uploadFile('assets/img/photo-about-the-author.png');

  if (bannerDesktop || bannerMobile || aboutImage) {
    const homepageData = {};
    if (bannerDesktop) homepageData.bannerImage = bannerDesktop.id;
    if (bannerMobile) homepageData.bannerImageMobile = bannerMobile.id;
    if (aboutImage) homepageData.aboutImage = aboutImage.id;

    await strapiRequest('/homepage', {
      method: 'PUT',
      body: JSON.stringify({ data: homepageData }),
    });
    console.log('  Homepage updated!\n');
  }

  // 3. Upload Event images
  console.log('3. Uploading Event images...');
  const eventsRes = await strapiRequest('/events?pagination[pageSize]=100');
  const events = eventsRes.data || [];

  for (const event of events) {
    const imagePath = eventImages[event.title];
    if (imagePath) {
      console.log(`  ${event.title}...`);
      const image = await uploadFile(imagePath);
      if (image) {
        await updateEntry('/events', event.documentId, { image: image.id });
      }
    }
  }
  console.log('  Events updated!\n');

  // 4. Upload Artwork images
  console.log('4. Uploading Artwork images...');
  const artworksRes = await strapiRequest('/artworks?pagination[pageSize]=100');
  const artworks = artworksRes.data || [];

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

  for (const artwork of artworks) {
    const imagePath = artworkImages[artwork.title];
    if (imagePath) {
      console.log(`  ${artwork.title}...`);
      const image = await uploadFile(imagePath);
      if (image) {
        await updateEntry('/artworks', artwork.documentId, { image: image.id });
      }
    }
  }
  console.log('  Artworks updated!\n');

  console.log('Done! Check http://localhost:1337/admin');
}

run().catch(console.error);
