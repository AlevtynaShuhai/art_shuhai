import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
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
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventPrice: number;
  eventLocation: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  leadId: number;
  securityNonce: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    eventName,
    eventDate,
    eventTime,
    eventPrice,
    eventLocation,
    customerName,
    customerEmail,
    customerPhone,
    message,
    leadId,
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
      leadId: leadId.toString(),
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
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}&lead_id=${leadId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}?canceled=true`,
  });

  return session;
}

export async function retrieveSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}
