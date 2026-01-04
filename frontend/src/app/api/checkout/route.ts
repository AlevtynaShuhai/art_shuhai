import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { createLead } from '@/lib/strapi';
import { addSubscriber } from '@/lib/googleSheets';
import crypto from 'crypto';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
  eventId: z.string().optional(), // documentId in Strapi v5
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

    if (!leadResponse?.data?.documentId) {
      throw new Error('Failed to create lead in Strapi');
    }
    const leadDocumentId = leadResponse.data.documentId;

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
      leadDocumentId,
      securityNonce,
    });

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
