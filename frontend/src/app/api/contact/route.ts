import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead } from '@/lib/strapi';
import { sendContactFormNotification } from '@/lib/telegram';

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

    // Send Telegram notification
    await sendContactFormNotification({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    });

    return NextResponse.json({ success: true });
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
