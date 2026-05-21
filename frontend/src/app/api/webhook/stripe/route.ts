import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, retrievePaymentIntent } from '@/lib/stripe';
import { updateLead, getLead, updateEvent, getSettings, getStrapiMediaUrl } from '@/lib/strapi';
import { sendOrderEmails } from '@/lib/email';
import { sendCapiEvent } from '@/lib/meta-capi';
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
  console.log('[Webhook] checkout.session.completed received');
  console.log('[Webhook] Session ID:', session.id);
  console.log('[Webhook] Metadata:', session.metadata);

  const metadata = session.metadata;
  if (!metadata?.leadDocumentId) {
    console.error('[Webhook] No leadDocumentId in session metadata');
    return;
  }

  const leadDocumentId = metadata.leadDocumentId;
  const paymentIntentId = session.payment_intent as string;

  console.log('[Webhook] Lead documentId:', leadDocumentId);
  console.log('[Webhook] Payment Intent ID:', paymentIntentId);

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
      console.log('[Webhook] Charge ID:', chargeId);
    } catch (err) {
      console.error('[Webhook] Failed to retrieve payment intent:', err);
    }
  }

  const updateData = {
    paymentStatus: 'paid' as const,
    orderStatus: 'new' as const,
    stripeSessionId: session.id,
    stripePaymentIntent: paymentIntentId,
    stripeChargeId: chargeId,
    stripeReceiptUrl: receiptUrl,
    amountPaid: (session.amount_total || 0) / 100,
    currency: session.currency || 'cad',
    paidAt: new Date().toISOString(),
  };

  console.log('[Webhook] Updating lead with:', updateData);

  // Update lead with full transaction details
  const result = await updateLead(leadDocumentId, updateData);

  if (result) {
    console.log('[Webhook] Lead updated successfully:', result);

    // Increment bookedSeats on the event if capacity tracking is enabled
    try {
      const leadData = await getLead(leadDocumentId);
      const event = leadData?.data?.event;
      const participants = parseInt(metadata.participants || '1', 10) || 1;

      if (event && event.capacity != null) {
        const newBookedSeats = (event.bookedSeats || 0) + participants;
        console.log('[Webhook] Incrementing bookedSeats for event:', event.documentId, 'from', event.bookedSeats || 0, 'to', newBookedSeats, '(participants:', participants, ')');

        await updateEvent(event.documentId, {
          bookedSeats: newBookedSeats,
        });
        console.log('[Webhook] Event bookedSeats updated successfully');
      }

      // Send order confirmation emails
      if (leadData?.data) {
        const lead = leadData.data;
        try {
          // Get settings for contact info
          const settingsData = await getSettings();
          const settings = settingsData?.data;

          // Get event image URL
          const eventImageUrl = event?.image ? getStrapiMediaUrl(event.image) : undefined;

          await sendOrderEmails({
            customerName: lead.name,
            customerEmail: lead.email,
            customerPhone: lead.phone,
            eventName: lead.eventName || 'Event',
            eventDate: lead.eventDate || '',
            eventTime: lead.eventTime || '',
            eventLocation: lead.eventLocation,
            eventImage: eventImageUrl,
            eventDescription: event?.shortDescription,
            eventIncludes: event?.includes?.map((item) => item.text),
            participants: lead.participants || 1,
            amountPaid: (session.amount_total || 0) / 100,
            currency: session.currency || 'cad',
            receiptUrl: receiptUrl,
            message: lead.message,
            contactEmail: settings?.email,
            contactPhone: settings?.phone,
          });
          console.log('[Webhook] Order confirmation emails sent');
        } catch (emailError) {
          console.error('[Webhook] Failed to send order emails:', emailError);
        }

        // Meta CAPI Purchase event — event_id = stripe session id so dedup with
        // any client-side fbq('track','Purchase',{eventID: session.id}) works.
        const [firstName, ...rest] = (lead.name || '').trim().split(/\s+/);
        const lastName = rest.join(' ') || undefined;
        sendCapiEvent({
          eventName: 'Purchase',
          eventId: session.id,
          eventSourceUrl: session.success_url || 'https://art-shuhai.com/thank-you',
          actionSource: 'website',
          userData: {
            email: lead.email,
            phone: lead.phone || undefined,
            firstName: firstName || undefined,
            lastName,
            country: 'ca',
          },
          customData: {
            value: (session.amount_total || 0) / 100,
            currency: (session.currency || 'cad').toUpperCase(),
            contentName: lead.eventName || undefined,
            contentIds: event?.documentId ? [event.documentId] : undefined,
            contentType: 'product',
            numItems: lead.participants || 1,
            orderId: session.id,
          },
        }).catch((err) => console.error('[Webhook CAPI] Purchase dispatch failed:', err));
      }
    } catch (err) {
      console.error('[Webhook] Failed to update event bookedSeats:', err);
    }
  } else {
    console.error('[Webhook] Failed to update lead:', leadDocumentId);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.leadDocumentId) return;

  const leadDocumentId = metadata.leadDocumentId;

  await updateLead(leadDocumentId, {
    paymentStatus: 'failed' as const,
    orderStatus: 'cancelled' as const,
    stripeSessionId: session.id,
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Additional handling if needed
}
