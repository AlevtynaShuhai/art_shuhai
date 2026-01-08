'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { trackPurchase } from '@/lib/analytics';
import { trackFBPurchase } from '@/components/Analytics/FacebookPixel';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once
    if (hasTracked.current) return;

    const sessionId = searchParams?.get('session_id');

    if (sessionId) {
      // Fetch session details and track purchase
      fetch(`/api/checkout/session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.session) {
            const { session } = data;

            // Track purchase in Google Analytics
            trackPurchase({
              transactionId: session.id,
              value: (session.amount_total || 0) / 100,
              items: [{
                id: session.metadata?.eventId || 'unknown',
                name: session.metadata?.eventName || 'Art Class',
                price: (session.amount_total || 0) / 100,
              }],
            });

            // Track purchase in Facebook Pixel
            trackFBPurchase((session.amount_total || 0) / 100);

            hasTracked.current = true;
          }
        })
        .catch(console.error);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center px-4 py-16">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
          Thank You!
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Your registration has been confirmed. We&apos;ve sent you an email with all the details.
        </p>

        <p className="text-gray-500 mb-8">
          We look forward to seeing you at the class!
        </p>

        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-full transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
