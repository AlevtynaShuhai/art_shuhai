const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
// Internal URL for server-side requests (Railway internal network)
const STRAPI_SERVER_URL = process.env.STRAPI_INTERNAL_URL || STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}

async function fetchStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  // Log if no token for mutation requests
  if (!STRAPI_TOKEN && options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    console.warn('[Strapi] No API token available for', options.method, endpoint);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    ...options.headers,
  };

  try {
    const url = `${STRAPI_SERVER_URL}/api${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Strapi] API error ${response.status} ${response.statusText}:`, errorBody);
      return null;
    }

    return response.json();
  } catch (error) {
    // Handle connection errors (e.g., Strapi not running)
    if (error instanceof Error) {
      console.error(`[Strapi] Connection failed: ${error.message}`);
    }
    return null;
  }
}

// Events
export async function getEvents(params?: {
  filters?: Record<string, unknown>;
  sort?: string[];
  populate?: string | string[];
}) {
  const searchParams = new URLSearchParams();

  if (params?.populate) {
    const populate = Array.isArray(params.populate)
      ? params.populate.join(',')
      : params.populate;
    searchParams.set('populate', populate);
  }

  if (params?.sort) {
    params.sort.forEach((s, i) => searchParams.set(`sort[${i}]`, s));
  }

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchStrapi<StrapiResponse<Event[]>>(`/events${query}`);
}

export async function getEvent(id: string) {
  return fetchStrapi<StrapiSingleResponse<Event>>(`/events/${id}?populate=*`);
}

// Artworks
export async function getArtworks(type?: 'student' | 'instructor') {
  let query = '?populate=*&sort=order:asc';
  if (type) {
    query += `&filters[type][$eq]=${type}`;
  }
  return fetchStrapi<StrapiResponse<Artwork[]>>(`/artworks${query}`);
}

// FAQs
export async function getFAQs() {
  return fetchStrapi<StrapiResponse<FAQ[]>>('/faqs?sort=order:asc');
}

// Homepage (Single Type)
export async function getHomepage() {
  return fetchStrapi<StrapiSingleResponse<Homepage>>(
    '/homepage?populate=*'
  );
}

// Settings (Single Type)
export async function getSettings() {
  return fetchStrapi<StrapiSingleResponse<Settings>>(
    '/setting?populate=*'
  );
}

// Leads (Create)
export async function createLead(data: CreateLeadInput) {
  // Format data for Strapi v5 relations
  const { event, ...rest } = data;
  const formattedData: Record<string, unknown> = { ...rest };

  // Connect event relation using documentId
  if (event) {
    formattedData.event = { connect: [event] };
  }

  return fetchStrapi<StrapiSingleResponse<Lead>>('/leads', {
    method: 'POST',
    body: JSON.stringify({ data: formattedData }),
  });
}

// Update Lead by documentId (Strapi v5)
export async function updateLead(documentId: string, data: Partial<Lead>) {
  return fetchStrapi<StrapiSingleResponse<Lead>>(`/leads/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// Get Lead with populated event
export async function getLead(documentId: string) {
  return fetchStrapi<StrapiSingleResponse<Lead & { event?: Event }>>(`/leads/${documentId}?populate=event`);
}

// Update Event by documentId
export async function updateEvent(documentId: string, data: Partial<Event>) {
  return fetchStrapi<StrapiSingleResponse<Event>>(`/events/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// Types
export interface Event {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  date: string;
  time?: string; // Legacy field for backwards compatibility
  startTime?: string;
  endTime?: string;
  flexibleSchedule?: boolean;
  price: number;
  discount?: number | null; // Sale price (if lower than price)
  priceLabel?: string;
  location: string;
  image: StrapiMedia;
  shortDescription: string;
  fullDescription: string;
  modalDescription?: string;
  includes: Array<{ id: number; text: string }>;
  eventType: 'one-time' | 'regular';
  isActive: boolean;
  capacity?: number | null; // Total seats (null = unlimited)
  bookedSeats?: number; // Number of booked seats
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Artwork {
  id: number;
  documentId: string;
  title?: string;
  image: StrapiMedia;
  type: 'student' | 'instructor';
  order: number;
}

export interface FAQ {
  id: number;
  documentId: string;
  question: string;
  answer: string;
  order: number;
}

export interface Lead {
  id: number;
  documentId: string;
  name: string;
  phone?: string;
  email: string;
  message?: string;
  event?: Event;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPrice?: number;
  eventLocation?: string;
  participants?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'new' | 'viewed' | 'confirmed' | 'completed' | 'cancelled';
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  stripeChargeId?: string;
  stripeReceiptUrl?: string;
  amountPaid?: number;
  currency?: string;
  paidAt?: string;
  securityNonce?: string;
  isSubscribed: boolean;
  notes?: string;
}

export interface CreateLeadInput {
  name: string;
  phone?: string;
  email: string;
  message?: string;
  event?: string; // documentId in Strapi v5
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPrice?: number;
  eventLocation?: string;
  participants?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  securityNonce?: string;
  isSubscribed?: boolean;
}

export interface Homepage {
  id: number;
  documentId: string;
  bannerTitle: string;
  bannerSubtitle?: string;
  bannerImage?: StrapiMedia;
  bannerImageMobile?: StrapiMedia;
  aboutTitle?: string;
  aboutText?: string;
  aboutImage?: StrapiMedia;
  cancellationPolicy?: string;
  whyChooseUsItems?: Array<{ title: string; description: string }>;
}

export interface Settings {
  id: number;
  documentId: string;
  siteName: string;
  email?: string;
  phone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  googleMapsEmbed?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  logoDesktop?: StrapiMedia;
  logoMobile?: StrapiMedia;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
  url: string;
}

interface StrapiMediaFormat {
  name: string;
  width: number;
  height: number;
  url: string;
}

// Helper to get full media URL
export function getStrapiMediaUrl(media?: StrapiMedia): string {
  if (!media || !media.url) return '/assets/img/placeholder.svg';
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}
