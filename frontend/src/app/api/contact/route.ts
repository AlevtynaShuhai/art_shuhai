import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead } from '@/lib/strapi';
import { sendCapiEvent, generateEventId, extractUserContext } from '@/lib/meta-capi';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Create lead in Strapi (as a contact form submission)
    await createLead({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
      paymentStatus: 'pending', // Not a payment, just contact
    });

    const eventId = generateEventId();
    const [firstName, ...rest] = validatedData.name.trim().split(/\s+/);
    const lastName = rest.join(' ') || undefined;

    sendCapiEvent({
      eventName: 'Lead',
      eventId,
      eventSourceUrl: request.headers.get('referer') || 'https://art-shuhai.com/',
      userData: {
        email: validatedData.email,
        firstName,
        lastName,
        country: 'ca',
        ...extractUserContext(request),
      },
    }).catch((err) => console.error('[Contact CAPI] dispatch failed:', err));

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
