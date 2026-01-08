// Google Analytics 4 - Event Tracking
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Check if analytics should be enabled
export const isAnalyticsEnabled = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!GA_ID &&
    process.env.NODE_ENV === 'production'
  );
};

// Core gtag function
export const gtag = (...args: unknown[]): void => {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.(...args);
};

// Page view tracking (for SPA navigation)
export const trackPageView = (url: string): void => {
  gtag('config', GA_ID, {
    page_path: url,
  });
};

// ----- E-commerce Events -----

// When user views a product/class
export const trackViewItem = (item: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void => {
  gtag('event', 'view_item', {
    currency: 'CAD',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || 'Art Class',
      price: item.price,
    }],
  });
};

// When user starts checkout
export const trackBeginCheckout = (items: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}[]): void => {
  const value = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  gtag('event', 'begin_checkout', {
    currency: 'CAD',
    value,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: 'Art Class',
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

// When purchase is completed
export const trackPurchase = (transaction: {
  transactionId: string;
  value: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }[];
}): void => {
  gtag('event', 'purchase', {
    transaction_id: transaction.transactionId,
    currency: 'CAD',
    value: transaction.value,
    items: transaction.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: 'Art Class',
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

// ----- Lead Generation Events -----

// When user submits a form (booking, contact, etc.)
export const trackFormSubmit = (formName: string, formData?: Record<string, unknown>): void => {
  gtag('event', 'generate_lead', {
    form_name: formName,
    ...formData,
  });
};

// When user signs up for newsletter or class
export const trackSignUp = (method: string): void => {
  gtag('event', 'sign_up', {
    method,
  });
};

// ----- Engagement Events -----

// When user clicks on important CTA
export const trackCTAClick = (ctaName: string, ctaLocation?: string): void => {
  gtag('event', 'cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
  });
};

// When user views a specific section
export const trackSectionView = (sectionName: string): void => {
  gtag('event', 'section_view', {
    section_name: sectionName,
  });
};

// Generic custom event
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
): void => {
  gtag('event', eventName, params);
};

// ----- Type declarations -----
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
