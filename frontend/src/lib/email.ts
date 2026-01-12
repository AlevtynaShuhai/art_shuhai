import { Resend } from 'resend';
import { OrderConfirmationCustomer } from '@/emails/OrderConfirmationCustomer';
import { OrderNotificationAdmin } from '@/emails/OrderNotificationAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation?: string;
  eventImage?: string;
  eventDescription?: string;
  eventIncludes?: string[];
  participants: number;
  amountPaid: number;
  currency: string;
  receiptUrl?: string;
  message?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY not configured');
    return;
  }

  // Send customer confirmation email
  try {
    await resend.emails.send({
      from: 'Drawing Master <noreply@drawingmaster.ca>',
      to: data.customerEmail,
      subject: `Booking Confirmed: ${data.eventName}`,
      react: OrderConfirmationCustomer({ data }),
    });
    console.log('[Email] Customer confirmation sent to:', data.customerEmail);
  } catch (error) {
    console.error('[Email] Failed to send customer email:', error);
  }

  // Send admin notification email
  if (adminEmail) {
    try {
      await resend.emails.send({
        from: 'Drawing Master <noreply@drawingmaster.ca>',
        to: adminEmail,
        subject: `New Booking: ${data.eventName} - ${data.customerName}`,
        react: OrderNotificationAdmin({ data }),
      });
      console.log('[Email] Admin notification sent to:', adminEmail);
    } catch (error) {
      console.error('[Email] Failed to send admin email:', error);
    }
  } else {
    console.warn('[Email] ADMIN_EMAIL not configured, skipping admin notification');
  }
}
