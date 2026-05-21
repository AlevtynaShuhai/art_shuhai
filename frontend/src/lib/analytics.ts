// Analytics — all events go through GTM dataLayer.
// GTM container fans them out to GA4 + Meta Pixel (+ CAPI on the server).

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const isBrowser = (): boolean => typeof window !== 'undefined';

const pushDataLayer = (payload: Record<string, unknown>): void => {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

const generateClientEventId = (): string => {
  if (isBrowser() && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID().replace(/-/g, '');
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
};

// ----- Page views (GA4 has Enhanced Measurement on All Pages, but we also
// push manually so SPA route changes are tracked) -----

export const trackPageView = (url: string): void => {
  pushDataLayer({ event: 'page_view', page_path: url });
};

// ----- Lead / contact form -----

export type LeadParams = {
  eventId?: string;
  formName?: string;
  email?: string;
};

export const trackLead = ({ eventId, formName }: LeadParams = {}): void => {
  pushDataLayer({
    event: 'lead_submit',
    event_id: eventId ?? generateClientEventId(),
    form_name: formName,
  });
};

// ----- Begin checkout -----

export type BeginCheckoutParams = {
  eventId?: string;
  value: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  numItems?: number;
};

export const trackBeginCheckout = (params: BeginCheckoutParams): void => {
  pushDataLayer({
    event: 'begin_checkout',
    event_id: params.eventId ?? generateClientEventId(),
    value: params.value,
    currency: params.currency ?? 'CAD',
    content_name: params.contentName,
    content_ids: params.contentIds,
    num_items: params.numItems ?? 1,
  });
};

// ----- Purchase -----

export type PurchaseParams = {
  eventId: string;
  value: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  numItems?: number;
};

export const trackPurchase = (params: PurchaseParams): void => {
  pushDataLayer({
    event: 'purchase',
    event_id: params.eventId,
    value: params.value,
    currency: params.currency ?? 'CAD',
    content_name: params.contentName,
    content_ids: params.contentIds,
    num_items: params.numItems ?? 1,
  });
};

// ----- Generic / utility -----

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>,
): void => {
  pushDataLayer({ event: eventName, ...params });
};

// ----- Backward-compatible aliases (some callers still import these) -----

export const trackFormSubmit = (formName: string): void => {
  trackLead({ formName });
};

export const trackFBLead = (): void => trackLead();

export const trackFBInitiateCheckout = (value: number, currency = 'CAD'): void => {
  trackBeginCheckout({ value, currency });
};

export const trackFBPurchase = (value: number, currency = 'CAD', eventId?: string): void => {
  trackPurchase({ eventId: eventId ?? generateClientEventId(), value, currency });
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
