import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

export interface CreateCheckoutSessionParams {
  eventId?: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventPrice: number;
  eventLocation: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  leadDocumentId: string;
  securityNonce: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    eventId,
    eventName,
    eventDate,
    eventTime,
    eventPrice,
    eventLocation,
    customerName,
    customerEmail,
    customerPhone,
    message,
    leadDocumentId,
    securityNonce,
  } = params;

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    currency: 'cad',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: eventName,
            description: `${eventDate} at ${eventTime}\n${eventLocation}`,
          },
          unit_amount: Math.round(eventPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      leadDocumentId,
      eventId: eventId || '',
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      message: message || '',
      securityNonce,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}&lead_id=${leadDocumentId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}?canceled=true`,
  });

  return session;
}

export async function retrieveSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}
