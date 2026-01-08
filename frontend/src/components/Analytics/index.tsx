'use client';

import GoogleAnalytics from './GoogleAnalytics';
import FacebookPixel from './FacebookPixel';

export default function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <FacebookPixel />
    </>
  );
}

export { GoogleAnalytics };
export { FacebookPixel };
export * from '@/lib/analytics';
export { trackFBPurchase, trackFBLead, trackFBInitiateCheckout, trackFBEvent } from './FacebookPixel';
