#!/usr/bin/env node

/**
 * Seed script for Strapi CMS
 * Uploads images and creates content from drawing-master v1
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN is not set in .env');
  console.error('Please create an API token in Strapi admin: Settings → API Tokens');
  process.exit(1);
}

const IMAGES_PATH = path.join(__dirname, '..', 'frontend', 'public');

// Helper to make API requests
async function strapiRequest(endpoint, options = {}) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strapi API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Upload a file to Strapi Media Library
async function uploadFile(filePath, fileName) {
  const fullPath = path.join(IMAGES_PATH, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`  Warning: File not found: ${fullPath}`);
    return null;
  }

  const form = new FormData();
  const fileBuffer = fs.readFileSync(fullPath);
  const name = fileName || path.basename(filePath);

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
    console.warn(`  Warning: Failed to upload ${filePath}: ${error}`);
    return null;
  }

  const result = await response.json();
  return result[0]; // Returns first uploaded file
}

// Get content type from filename
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

// Events data from v1
const events = [
  {
    title: 'Wine Painting Class',
    slug: 'wine-painting-class',
    date: '2026-01-07',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Explore the unique art of painting with red wine as you create elegant floral compositions using natural pigments and soft tonal transitions.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/WP.JPG',
  },
  {
    title: 'Spirit Island in Watercolor',
    slug: 'spirit-island-watercolor',
    date: '2026-01-09',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A calm and immersive watercolor class where you\'ll learn to capture the atmosphere, depth, and reflections of the iconic Spirit Island landscape step by step.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/SI.PNG',
  },
  {
    title: 'Sunset Glow Acrylic Class',
    slug: 'sunset-glow-acrylic',
    date: '2026-01-14',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Explore how to paint a radiant winter sunset using layered acrylic techniques that capture both warm light and cool shadows on snow.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/SG.PNG',
  },
  {
    title: 'Quiet Moment Acrylic Class',
    slug: 'quiet-moment-acrylic',
    date: '2026-01-19',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A peaceful acrylic painting class focused on expressive texture and mood, where you\'ll learn to convey quiet emotion and atmosphere through layered brushstrokes and subtle color relationships.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/QM.PNG',
  },
  {
    title: 'Edge of Summer Acrylic Class',
    slug: 'edge-of-summer-acrylic',
    date: '2026-01-21',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A vibrant acrylic class where you\'ll explore light, color, and texture to capture the warmth of a summer shoreline through expressive brushwork and layered paint.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/DR.PNG',
  },
  {
    title: 'Acrylic Peyto Lake Landscape',
    slug: 'peyto-lake-landscape',
    date: '2026-01-23',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Learn to capture the dramatic winter atmosphere of Peyto Lake through expressive acrylic layering and textured brushwork.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/PL.PNG',
  },
  {
    title: 'Frost and Sun in Watercolor',
    slug: 'frost-sun-watercolor',
    date: '2026-01-28',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A poetic watercolor class focused on capturing the contrast of crisp winter air and warm sunlight through transparent layers, soft transitions, and expressive reflections.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/FS.PNG',
  },
  {
    title: 'Your Pet Acrylic Portrait',
    slug: 'pet-acrylic-portrait',
    date: '2026-01-30',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Capture the unique charm and personality of your beloved pet through expressive acrylic brushwork.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/PP.JPG',
  },
  {
    title: 'Citrus Therapy Acrylic Class',
    slug: 'citrus-therapy-acrylic',
    date: '2026-02-04',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A beginner-friendly acrylic class where you\'ll explore texture and color while painting a lively citrus still life.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/mnd.PNG',
  },
  {
    title: 'Into the Rockies Acrylic Class',
    slug: 'into-rockies-acrylic',
    date: '2026-02-06',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Explore depth, atmosphere, and texture in this acrylic class inspired by the roads and peaks of the Canadian Rockies.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1695.PNG',
  },
  {
    title: 'Winter on Fire Acrylic Class',
    slug: 'winter-on-fire-acrylic',
    date: '2026-02-11',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'Capture the contrast of icy snow and fiery sunset in this guided acrylic class focused on mood, color, and movement.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1677.PNG',
  },
  {
    title: 'Beyond Today Acrylic Class',
    slug: 'beyond-today-acrylic',
    date: '2026-02-13',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A guided acrylic class inspired by the feeling of release, using warm skies, soft clouds, and bold, flowing strokes.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1673.PNG',
  },
  {
    title: 'Silent Light Acrylic Class',
    slug: 'silent-light-acrylic',
    date: '2026-02-18',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A serene acrylic class focused on capturing quiet winter light, long shadows, and gentle color harmony.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1680.PNG',
  },
  {
    title: 'February Watercolor Class',
    slug: 'february-watercolor',
    date: '2026-02-20',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A gentle watercolor class exploring February light, translucent layers, and the quiet poetry of a winter landscape.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1724.PNG',
  },
  {
    title: 'Echoes of Flame Acrylic Class',
    slug: 'echoes-flame-acrylic',
    date: '2026-02-25',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'An expressive acrylic class where we explore contrast, movement, and glowing light against a deep, moody landscape.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1692.PNG',
  },
  {
    title: 'Awaiting Spring Acrylic Class',
    slug: 'awaiting-spring-acrylic',
    date: '2026-02-27',
    time: '6:00 pm - 9:00 pm',
    price: 78,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
    fullDescription: 'A guided acrylic class exploring loose brushwork, soft backgrounds, and vibrant floral accents.',
    includes: ['All art supplies', 'Snacks and beverages', 'Step-by-step guidance'],
    eventType: 'one-time',
    isActive: true,
    imageFile: 'assets/img/IMG_1694.PNG',
  },
  // Regular events
  {
    title: 'Regular Art Classes for Adults',
    slug: 'regular-art-classes-adults',
    date: '2026-01-11', // First Saturday
    time: '3:00 pm - 6:00 pm',
    price: 231,
    location: '1324 11 Ave SW, #202, Calgary',
    shortDescription: 'All supplies provided',
    fullDescription: 'Master visual arts through group lessons designed to your interests and skill level. Explore painting, drawing, and composition at your own pace in a relaxed and supportive environment.',
    includes: ['All art supplies', '4 classes package', 'Personalized guidance'],
    discount: 'for four classes',
    eventType: 'regular',
    isActive: true,
    imageFile: 'assets/img/photo.webp',
  },
  {
    title: 'Private Art Classes',
    slug: 'private-art-classes',
    date: '2026-01-06', // Monday
    time: 'Flexible schedule',
    price: 75,
    location: 'IN ART Studio, 1324 11 Ave SW, #202, Calgary',
    shortDescription: 'All supplies provided',
    fullDescription: 'Creativity, dreams, inspiration - the world of art awaits you! We practice a variety of techniques, materials and subjects in our classes.',
    includes: ['All art supplies', 'One-on-one instruction', 'Flexible scheduling'],
    discount: 'for 1 hour',
    eventType: 'regular',
    isActive: true,
    imageFile: 'assets/img/adults.JPG',
  },
];

// Gallery artworks
const studentArtworks = [
  { title: 'Student Artwork 1', imageFile: 'assets/img/gallery/student_artwork/IMG_1819.webp', type: 'student', order: 1 },
  { title: 'Student Artwork 2', imageFile: 'assets/img/gallery/student_artwork/IMG_1014.webp', type: 'student', order: 2 },
  { title: 'Student Artwork 3', imageFile: 'assets/img/gallery/student_artwork/IMG_0552.webp', type: 'student', order: 3 },
  { title: 'Student Artwork 4', imageFile: 'assets/img/gallery/student_artwork/IMG_3963.webp', type: 'student', order: 4 },
];

const instructorArtworks = [
  { title: 'Instructor Artwork 1', imageFile: 'assets/img/gallery/my_artwork/IMG_1469.webp', type: 'instructor', order: 1 },
  { title: 'Instructor Artwork 2', imageFile: 'assets/img/gallery/my_artwork/IMG_7640.webp', type: 'instructor', order: 2 },
  { title: 'Instructor Artwork 3', imageFile: 'assets/img/gallery/my_artwork/IMG_5363.webp', type: 'instructor', order: 3 },
  { title: 'Instructor Artwork 4', imageFile: 'assets/img/gallery/my_artwork/IMG_3931.webp', type: 'instructor', order: 4 },
];

// Main seed function
async function seed() {
  console.log('Starting Strapi seed...\n');

  // 1. Create Settings
  console.log('1. Creating Settings...');
  try {
    // Upload logos
    let logoDesktop = null;
    let logoMobile = null;

    console.log('  Uploading logos...');
    logoDesktop = await uploadFile('assets/img/logo-art.svg');
    logoMobile = await uploadFile('assets/img/logo-art-mb.svg');

    const settingsData = {
      siteName: 'Art Classes with Alevtyna',
      email: 'info@artwithalevtyna.ca',
      phone: '+1 (403) 555-0123',
      address: '1324 11 Ave SW, #202, Calgary, AB',
      instagramUrl: 'https://www.instagram.com/in_art_studio_calgary/',
      facebookUrl: 'https://www.facebook.com/profile.php?id=100087892498498',
      googleMapsEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2508.4394886851867!2d-114.08144548423!3d51.04056097956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53716fe1f0b7f5e5%3A0x8b0b0b0b0b0b0b0b!2s1324%2011%20Ave%20SW%2C%20Calgary%2C%20AB!5e0!3m2!1sen!2sca!4v1234567890" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
      ...(logoDesktop && { logoDesktop: logoDesktop.id }),
      ...(logoMobile && { logoMobile: logoMobile.id }),
    };

    await strapiRequest('/setting', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: settingsData }),
    });
    console.log('  Settings created!\n');
  } catch (error) {
    console.error('  Error creating settings:', error.message);
  }

  // 2. Create Homepage
  console.log('2. Creating Homepage...');
  try {
    console.log('  Uploading banner images...');
    const bannerDesktop = await uploadFile('assets/img/bg-main-banner.webp');
    const bannerMobile = await uploadFile('assets/img/bg-mobile-banner.webp');
    const aboutImage = await uploadFile('assets/img/photo-about-the-author.png');

    const homepageData = {
      bannerTitle: 'Art Classes with Alevtyna',
      bannerSubtitle: 'Join creative art classes and workshops in Calgary. Learn painting, drawing, and more with professional instruction.',
      aboutTitle: 'About Me',
      aboutText: '<p>Hello! I\'m Alevtyna, a professional artist and art instructor based in Calgary. With over 10 years of experience in various art techniques, I\'m passionate about sharing the joy of creating art with others.</p><p>My classes are designed to be relaxing, inspiring, and accessible to everyone - from complete beginners to experienced artists looking to explore new techniques.</p><p>I believe that everyone has an artist within them, and my goal is to help you discover yours!</p>',
      cancellationPolicy: 'Full refund if cancelled 48 hours before the class. 50% refund if cancelled 24 hours before. No refund for cancellations less than 24 hours before the class.',
      ...(bannerDesktop && { bannerImage: bannerDesktop.id }),
      ...(bannerMobile && { bannerImageMobile: bannerMobile.id }),
      ...(aboutImage && { aboutImage: aboutImage.id }),
    };

    await strapiRequest('/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: homepageData }),
    });
    console.log('  Homepage created!\n');
  } catch (error) {
    console.error('  Error creating homepage:', error.message);
  }

  // 3. Create Events
  console.log('3. Creating Events...');
  for (const event of events) {
    try {
      console.log(`  Creating: ${event.title}...`);

      // Upload image
      const image = await uploadFile(event.imageFile);

      const eventData = {
        title: event.title,
        slug: event.slug,
        date: event.date,
        time: event.time,
        price: event.price,
        location: event.location,
        shortDescription: event.shortDescription,
        fullDescription: event.fullDescription,
        includes: event.includes,
        eventType: event.eventType,
        isActive: event.isActive,
        ...(event.discount && { discount: event.discount }),
        ...(image && { image: image.id }),
      };

      await strapiRequest('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: eventData }),
      });
      console.log(`    Created!`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
    }
  }
  console.log('  Events done!\n');

  // 4. Create Artworks
  console.log('4. Creating Artworks...');
  const allArtworks = [...studentArtworks, ...instructorArtworks];

  for (const artwork of allArtworks) {
    try {
      console.log(`  Creating: ${artwork.title}...`);

      const image = await uploadFile(artwork.imageFile);

      const artworkData = {
        title: artwork.title,
        type: artwork.type,
        order: artwork.order,
        ...(image && { image: image.id }),
      };

      await strapiRequest('/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: artworkData }),
      });
      console.log(`    Created!`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
    }
  }
  console.log('  Artworks done!\n');

  // 5. Create FAQs
  console.log('5. Creating FAQs...');
  const faqs = [
    {
      question: 'Do I need any prior art experience?',
      answer: 'No! Our classes are designed for all skill levels, from complete beginners to experienced artists. We guide you step by step through each project.',
      order: 1,
    },
    {
      question: 'What materials do I need to bring?',
      answer: 'Nothing! All art supplies are included in the class fee. Just bring yourself and your creativity. We also provide snacks and beverages.',
      order: 2,
    },
    {
      question: 'How long are the classes?',
      answer: 'Most of our evening classes run for 3 hours (6:00 PM - 9:00 PM). This gives you plenty of time to create your masterpiece without feeling rushed.',
      order: 3,
    },
    {
      question: 'Can I bring my own wine or drinks?',
      answer: 'We provide complimentary snacks and non-alcoholic beverages. For wine painting classes, wine is included. You\'re welcome to bring additional beverages if you prefer.',
      order: 4,
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Full refund if cancelled 48 hours before the class. 50% refund if cancelled 24 hours before. No refund for cancellations less than 24 hours before the class.',
      order: 5,
    },
    {
      question: 'Can I book a private event or party?',
      answer: 'Absolutely! We offer private art parties for birthdays, corporate events, bachelorette parties, and more. Contact us to discuss your event needs.',
      order: 6,
    },
  ];

  for (const faq of faqs) {
    try {
      console.log(`  Creating FAQ: ${faq.question.substring(0, 30)}...`);

      await strapiRequest('/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: faq }),
      });
      console.log(`    Created!`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
    }
  }
  console.log('  FAQs done!\n');

  console.log('Seed completed! Check Strapi admin at http://localhost:1337/admin');
}

// Run seed
seed().catch(console.error);
