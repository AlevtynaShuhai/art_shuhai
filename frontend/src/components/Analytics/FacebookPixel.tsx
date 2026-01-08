'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Check if FB Pixel should be enabled
const isPixelEnabled = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!FB_PIXEL_ID &&
    process.env.NODE_ENV === 'production'
  );
};

// Facebook Pixel tracking functions
export const fbq = (...args: unknown[]): void => {
  if (!isPixelEnabled()) return;
  window.fbq?.(...args);
};

// Track page view
export const trackFBPageView = (): void => {
  fbq('track', 'PageView');
};

// Track purchase
export const trackFBPurchase = (value: number, currency = 'CAD'): void => {
  fbq('track', 'Purchase', { value, currency });
};

// Track lead (form submission)
export const trackFBLead = (): void => {
  fbq('track', 'Lead');
};

// Track add to cart / begin checkout
export const trackFBInitiateCheckout = (value: number, currency = 'CAD'): void => {
  fbq('track', 'InitiateCheckout', { value, currency });
};

// Custom event
export const trackFBEvent = (eventName: string, params?: Record<string, unknown>): void => {
  fbq('track', eventName, params);
};

// Type declarations
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export default function FacebookPixel() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    if (isPixelEnabled()) {
      trackFBPageView();
    }
  }, [pathname]);

  // Don't render in development or if FB_PIXEL_ID is not set
  if (!FB_PIXEL_ID || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
