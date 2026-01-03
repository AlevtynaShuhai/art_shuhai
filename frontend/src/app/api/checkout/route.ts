import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { createLead } from '@/lib/strapi';
import { sendNewOrderNotification } from '@/lib/telegram';
import { addSubscriber } from '@/lib/googleSheets';
import crypto from 'crypto';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
  eventId: z.number().optional(),
  eventName: z.string(),
  eventDate: z.string(),
  eventTime: z.string(),
  eventPrice: z.number().positive(),
  eventLocation: z.string(),
  isSubscribed: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // Generate security nonce
    const securityNonce = crypto.randomBytes(32).toString('hex');

    // Create lead in Strapi
    const leadResponse = await createLead({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message: validatedData.message,
      event: validatedData.eventId,
      eventName: validatedData.eventName,
      eventDate: validatedData.eventDate,
      eventTime: validatedData.eventTime,
      eventPrice: validatedData.eventPrice,
      eventLocation: validatedData.eventLocation,
      paymentStatus: 'pending',
      securityNonce,
      isSubscribed: validatedData.isSubscribed,
    });

    if (!leadResponse?.data?.id) {
      throw new Error('Failed to create lead in Strapi');
    }
    const leadId = leadResponse.data.id;

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      eventName: validatedData.eventName,
      eventDate: validatedData.eventDate,
      eventTime: validatedData.eventTime,
      eventPrice: validatedData.eventPrice,
      eventLocation: validatedData.eventLocation,
      customerName: validatedData.name,
      customerEmail: validatedData.email,
      customerPhone: validatedData.phone,
      message: validatedData.message,
      leadId,
      securityNonce,
    });

    // Send Telegram notification (async, don't wait)
    sendNewOrderNotification({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message: validatedData.message,
      eventName: validatedData.eventName,
      eventDate: validatedData.eventDate,
      eventTime: validatedData.eventTime,
      eventPrice: validatedData.eventPrice,
      eventLocation: validatedData.eventLocation,
    }).catch(console.error);

    // Add to Google Sheets if subscribed (async, don't wait)
    if (validatedData.isSubscribed) {
      addSubscriber({
        name: validatedData.name,
        email: validatedData.email,
      }).catch(console.error);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
