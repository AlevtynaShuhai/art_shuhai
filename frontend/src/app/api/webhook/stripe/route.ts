import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { updateLead } from '@/lib/strapi';
import { sendPaymentSuccessNotification } from '@/lib/telegram';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
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

  // Update lead status
  await updateLead(leadId, {
    paymentStatus: 'paid',
    stripeSessionId: session.id,
    stripePaymentIntent: session.payment_intent as string,
    telegramSent: true,
  });

  // Send success notification
  await sendPaymentSuccessNotification({
    name: metadata.customerName || 'Unknown',
    email: metadata.customerEmail || 'Unknown',
    phone: metadata.customerPhone,
    eventName: metadata.eventName || 'Unknown',
    eventDate: metadata.eventDate || 'Unknown',
    eventTime: metadata.eventTime || 'Unknown',
    eventPrice: parseFloat(session.amount_total?.toString() || '0') / 100,
    eventLocation: metadata.eventLocation || 'Unknown',
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.leadId) return;

  const leadId = parseInt(metadata.leadId, 10);

  await updateLead(leadId, {
    paymentStatus: 'failed',
    stripeSessionId: session.id,
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Additional handling if needed
}
