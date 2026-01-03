import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, retrievePaymentIntent } from '@/lib/stripe';
import { updateLead } from '@/lib/strapi';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret at runtime (not build time)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.leadId) {
    console.error('No leadId in session metadata');
    return;
  }

  const leadId = parseInt(metadata.leadId, 10);
  const paymentIntentId = session.payment_intent as string;

  // Get payment intent with charge details
  let chargeId: string | undefined;
  let receiptUrl: string | undefined;

  if (paymentIntentId) {
    try {
      const paymentIntent = await retrievePaymentIntent(paymentIntentId);
      const charge = paymentIntent.latest_charge as Stripe.Charge;
      if (charge) {
        chargeId = charge.id;
        receiptUrl = charge.receipt_url || undefined;
      }
    } catch (err) {
      console.error('Failed to retrieve payment intent:', err);
    }
  }

  // Update lead with full transaction details
  await updateLead(leadId, {
    paymentStatus: 'paid',
    orderStatus: 'new',
    stripeSessionId: session.id,
    stripePaymentIntent: paymentIntentId,
    stripeChargeId: chargeId,
    stripeReceiptUrl: receiptUrl,
    amountPaid: (session.amount_total || 0) / 100,
    currency: session.currency || 'cad',
    paidAt: new Date().toISOString(),
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.leadId) return;

  const leadId = parseInt(metadata.leadId, 10);

  await updateLead(leadId, {
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    stripeSessionId: session.id,
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Additional handling if needed
}
