const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
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
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    ...options.headers,
  };

  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
  return fetchStrapi<StrapiSingleResponse<Lead>>('/leads', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// Update Lead
export async function updateLead(id: number, data: Partial<Lead>) {
  return fetchStrapi<StrapiSingleResponse<Lead>>(`/leads/${id}`, {
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
  location: string;
  image: StrapiMedia;
  shortDescription: string;
  fullDescription: string;
  includes: string[];
  discount?: string;
  eventType: 'one-time' | 'regular';
  isActive: boolean;
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
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  securityNonce?: string;
  telegramSent: boolean;
  isSubscribed: boolean;
}

export interface CreateLeadInput {
  name: string;
  phone?: string;
  email: string;
  message?: string;
  event?: number;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPrice?: number;
  eventLocation?: string;
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
  if (!media) return '';
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}
