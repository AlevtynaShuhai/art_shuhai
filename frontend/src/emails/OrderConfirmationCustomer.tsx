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

interface OrderConfirmationCustomerProps {
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
  eventDescription: 'Beginner-friendly. All supplies provided + snacks and beverages',
  eventIncludes: ['All art supplies', 'Canvas and brushes', 'Snacks and beverages', 'Take home your artwork'],
  participants: 2,
  amountPaid: 156,
  currency: 'CAD',
  receiptUrl: 'https://stripe.com/receipt',
  message: 'Looking forward to it!',
  contactEmail: 'info@drawingmaster.ca',
  contactPhone: '+1 (647) 123-4567',
};

const LOGO_URL = 'https://res.cloudinary.com/djufnjptv/image/upload/web_app_manifest_192x192_8cd5fa0777';

// Icons - PNG format via Cloudinary transformation
const ICON_DATE = 'https://res.cloudinary.com/djufnjptv/image/upload/f_png/email-icons/icon-date';
const ICON_PRICE = 'https://res.cloudinary.com/djufnjptv/image/upload/f_png/email-icons/icon-price';
const ICON_LOCATION = 'https://res.cloudinary.com/djufnjptv/image/upload/f_png/email-icons/icon-location';
const ICON_PEOPLE = 'https://res.cloudinary.com/djufnjptv/image/upload/f_png/email-icons/icon-price';

export function OrderConfirmationCustomer({ data = previewData }: OrderConfirmationCustomerProps) {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amountPaid);

  return (
    <Html>
      <Head />
      <Preview>Your booking for {data.eventName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={LOGO_URL}
              width="70"
              height="70"
              alt="Drawing Master"
              style={logoImage}
            />
          </Section>

          <Heading style={mainHeading}>Booking Confirmed</Heading>

          <Text style={greeting}>
            Dear {data.customerName}, thank you for your booking!
          </Text>

          {/* Event Card */}
          <Section style={eventCard}>
            {/* Event Image */}
            {data.eventImage && (
              <Img
                src={data.eventImage}
                width="540"
                alt={data.eventName}
                style={eventImageStyle}
              />
            )}

            {/* Event Title */}
            <Heading as="h2" style={eventTitle}>{data.eventName}</Heading>

            {/* Event Details */}
            <Section style={detailsSection}>
              <table style={detailTable}>
                <tr>
                  <td style={iconCell}>
                    <Img src={ICON_DATE} width="20" height="20" alt="" style={iconImg} />
                  </td>
                  <td style={textCell}>{data.eventDate}, {data.eventTime}</td>
                </tr>
                <tr>
                  <td style={iconCell}>
                    <Img src={ICON_PRICE} width="20" height="20" alt="" style={iconImg} />
                  </td>
                  <td style={textCell}><strong>{formattedAmount}</strong></td>
                </tr>
                {data.eventLocation && (
                  <tr>
                    <td style={iconCell}>
                      <Img src={ICON_LOCATION} width="20" height="20" alt="" style={iconImg} />
                    </td>
                    <td style={textCell}>{data.eventLocation}</td>
                  </tr>
                )}
                <tr>
                  <td style={iconCell}>
                    <Img src={ICON_PEOPLE} width="20" height="20" alt="" style={iconImg} />
                  </td>
                  <td style={textCell}>{data.participants} participant{data.participants > 1 ? 's' : ''}</td>
                </tr>
              </table>

              {/* Description */}
              {data.eventDescription && (
                <Text style={descriptionText}>{data.eventDescription}</Text>
              )}

              {/* What's Included */}
              {data.eventIncludes && data.eventIncludes.length > 0 && (
                <Section style={includesSection}>
                  <Text style={includesTitle}>What&apos;s Included:</Text>
                  {data.eventIncludes.map((item, index) => (
                    <Text key={index} style={includeItem}>✓ {item}</Text>
                  ))}
                </Section>
              )}
            </Section>

            {/* Receipt Button */}
            {data.receiptUrl && (
              <Section style={buttonSection}>
                <Link href={data.receiptUrl} style={receiptButton}>
                  View Receipt
                </Link>
              </Section>
            )}
          </Section>

          {/* Contact Info */}
          <Section style={contactSection}>
            <Text style={contactTitle}>Questions? Contact us:</Text>
            <Text style={contactText}>
              {data.contactEmail && (
                <Link href={`mailto:${data.contactEmail}`} style={contactLink}>{data.contactEmail}</Link>
              )}
              {data.contactEmail && data.contactPhone && ' • '}
              {data.contactPhone && (
                <Link href={`tel:${data.contactPhone}`} style={contactLink}>{data.contactPhone}</Link>
              )}
            </Text>
          </Section>

          <Text style={closingText}>
            We look forward to seeing you!
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            <Link href="https://drawingmaster.ca" style={footerLink}>
              drawingmaster.ca
            </Link>
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
  borderRadius: '24px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logoImage = {
  margin: '0 auto',
};

const mainHeading = {
  color: '#171717',
  fontSize: '28px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontWeight: '400' as const,
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const greeting = {
  color: '#666666',
  fontSize: '15px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const eventCard = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  marginBottom: '32px',
};

const eventImageStyle = {
  width: '100%',
  height: 'auto',
  display: 'block' as const,
  borderRadius: '20px 20px 0 0',
};

const eventTitle = {
  color: '#171717',
  fontSize: '24px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontWeight: '400' as const,
  margin: '24px 24px 20px',
  lineHeight: '1.3',
};

const detailsSection = {
  padding: '0 24px',
};

const detailTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const iconCell = {
  width: '32px',
  paddingBottom: '12px',
  verticalAlign: 'middle' as const,
};

const iconImg = {
  display: 'block' as const,
};

const textCell = {
  color: '#171717',
  fontSize: '15px',
  paddingBottom: '12px',
  verticalAlign: 'middle' as const,
  lineHeight: '1.5',
};

const descriptionText = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0 0',
};

const includesSection = {
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid #eeeeee',
};

const includesTitle = {
  color: '#171717',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
};

const includeItem = {
  color: '#555555',
  fontSize: '14px',
  margin: '0 0 4px',
  lineHeight: '1.5',
};

const buttonSection = {
  padding: '24px',
};

const receiptButton = {
  backgroundColor: '#FFB785',
  borderRadius: '50px',
  color: '#171717',
  display: 'block',
  fontSize: '16px',
  fontWeight: '500' as const,
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const contactSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const contactTitle = {
  color: '#888888',
  fontSize: '13px',
  margin: '0 0 6px',
};

const contactText = {
  color: '#171717',
  fontSize: '14px',
  margin: '0',
};

const contactLink = {
  color: '#FFB785',
  textDecoration: 'none',
};

const closingText = {
  color: '#171717',
  fontSize: '15px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const divider = {
  borderColor: '#eeeeee',
  margin: '0 0 20px',
};

const footer = {
  textAlign: 'center' as const,
  margin: '0',
};

const footerLink = {
  color: '#999999',
  fontSize: '13px',
  textDecoration: 'none',
};

export default OrderConfirmationCustomer;
