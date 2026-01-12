import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import type { OrderEmailData } from '@/lib/email';

interface OrderNotificationAdminProps {
  data?: OrderEmailData;
}

const previewData: OrderEmailData = {
  customerName: 'Анна Иванова',
  customerEmail: 'anna@example.com',
  customerPhone: '+1 (555) 123-4567',
  eventName: 'Echoes of Flame Acrylic Class',
  eventDate: 'Tuesday, February 24',
  eventTime: '6:00 pm - 9:00 pm',
  eventLocation: '1324 11 Ave SW, #202, Calgary',
  eventImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
  participants: 2,
  amountPaid: 156,
  currency: 'CAD',
  receiptUrl: 'https://stripe.com/receipt',
  message: 'Looking forward to the class! Can we sit together?',
  contactEmail: 'info@drawingmaster.ca',
  contactPhone: '+1 (647) 123-4567',
};

const LOGO_URL = 'https://res.cloudinary.com/djufnjptv/image/upload/web_app_manifest_192x192_8cd5fa0777';

export function OrderNotificationAdmin({ data = previewData }: OrderNotificationAdminProps) {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amountPaid);

  return (
    <Html>
      <Head />
      <Preview>New order from {data.customerName} - {data.eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={LOGO_URL}
              width="50"
              height="50"
              alt="Drawing Master"
              style={logoImage}
            />
          </Section>

          {/* Badge */}
          <Section style={badgeSection}>
            <Text style={badge}>NEW ORDER</Text>
          </Section>

          <Heading style={mainHeading}>New Booking Received</Heading>

          {/* Customer Info Card */}
          <Section style={card}>
            <Text style={cardTitle}>Customer Information</Text>

            <table style={infoTable}>
              <tr>
                <td style={labelCell}>Name</td>
                <td style={valueCell}>{data.customerName}</td>
              </tr>
              <tr>
                <td style={labelCell}>Email</td>
                <td style={valueCell}>
                  <Link href={`mailto:${data.customerEmail}`} style={linkStyle}>
                    {data.customerEmail}
                  </Link>
                </td>
              </tr>
              {data.customerPhone && (
                <tr>
                  <td style={labelCell}>Phone</td>
                  <td style={valueCell}>
                    <Link href={`tel:${data.customerPhone}`} style={linkStyle}>
                      {data.customerPhone}
                    </Link>
                  </td>
                </tr>
              )}
            </table>

            {data.message && (
              <Section style={messageSection}>
                <Text style={messageLabel}>Message from customer:</Text>
                <Text style={messageText}>&ldquo;{data.message}&rdquo;</Text>
              </Section>
            )}
          </Section>

          {/* Event Card */}
          <Section style={card}>
            <Text style={cardTitle}>Event Details</Text>

            <table style={eventTable}>
              <tr>
                {data.eventImage && (
                  <td style={thumbnailCell}>
                    <Img
                      src={data.eventImage}
                      width="80"
                      height="80"
                      alt={data.eventName}
                      style={thumbnail}
                    />
                  </td>
                )}
                <td style={eventInfoCell}>
                  <Text style={eventName}>{data.eventName}</Text>
                  <Text style={eventDetail}>{data.eventDate}</Text>
                  <Text style={eventDetail}>{data.eventTime}</Text>
                  {data.eventLocation && (
                    <Text style={eventDetail}>{data.eventLocation}</Text>
                  )}
                </td>
              </tr>
            </table>

            <Hr style={cardDivider} />

            <table style={infoTable}>
              <tr>
                <td style={labelCell}>Participants</td>
                <td style={valueCell}><strong>{data.participants}</strong></td>
              </tr>
            </table>
          </Section>

          {/* Payment Card */}
          <Section style={paymentCard}>
            <Text style={paymentTitle}>PAYMENT</Text>
            <Text style={paymentAmount}>{formattedAmount}</Text>
            <Text style={paymentCurrency}>{data.currency.toUpperCase()}</Text>

            {data.receiptUrl && (
              <Link href={data.receiptUrl} style={receiptLink}>
                View Stripe Receipt →
              </Link>
            )}
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This is an automated notification from Drawing Master
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  padding: '40px 20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 30px',
  maxWidth: '600px',
  borderRadius: '16px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const logoImage = {
  margin: '0 auto',
};

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const badge = {
  backgroundColor: '#FFB785',
  color: '#171717',
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '700' as const,
  padding: '6px 16px',
  borderRadius: '20px',
  letterSpacing: '1px',
  margin: '0',
};

const mainHeading = {
  color: '#171717',
  fontSize: '24px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontWeight: '400' as const,
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const card = {
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const cardTitle = {
  color: '#888888',
  fontSize: '11px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  color: '#888888',
  fontSize: '13px',
  paddingBottom: '8px',
  width: '100px',
  verticalAlign: 'top' as const,
};

const valueCell = {
  color: '#171717',
  fontSize: '14px',
  paddingBottom: '8px',
  verticalAlign: 'top' as const,
};

const linkStyle = {
  color: '#FFB785',
  textDecoration: 'none',
};

const messageSection = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #eeeeee',
};

const messageLabel = {
  color: '#888888',
  fontSize: '12px',
  margin: '0 0 8px',
};

const messageText = {
  color: '#171717',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  margin: '0',
  lineHeight: '1.5',
};

const eventTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const thumbnailCell = {
  width: '90px',
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const thumbnail = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const eventInfoCell = {
  verticalAlign: 'top' as const,
};

const eventName = {
  color: '#171717',
  fontSize: '16px',
  fontWeight: '500' as const,
  margin: '0 0 4px',
  lineHeight: '1.3',
};

const eventDetail = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 2px',
  lineHeight: '1.4',
};

const cardDivider = {
  borderColor: '#eeeeee',
  margin: '16px 0',
};

const paymentCard = {
  backgroundColor: '#171717',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const paymentTitle = {
  color: '#888888',
  fontSize: '11px',
  fontWeight: '600' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const paymentAmount = {
  color: '#FFB785',
  fontSize: '36px',
  fontWeight: '600' as const,
  margin: '0',
  lineHeight: '1',
};

const paymentCurrency = {
  color: '#666666',
  fontSize: '14px',
  margin: '8px 0 16px',
};

const receiptLink = {
  color: '#ffffff',
  fontSize: '13px',
  textDecoration: 'none',
};

const divider = {
  borderColor: '#eeeeee',
  margin: '0 0 16px',
};

const footer = {
  color: '#999999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};

export default OrderNotificationAdmin;
