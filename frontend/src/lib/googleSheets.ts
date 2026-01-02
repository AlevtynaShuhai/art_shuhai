import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

interface SubscriberData {
  name: string;
  email: string;
  subscribedAt?: string;
}

async function getGoogleSheetsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export async function addSubscriber(data: SubscriberData): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();

    // Check for duplicate email first
    const isDuplicate = await checkDuplicateEmail(data.email);
    if (isDuplicate) {
      console.log(`Email ${data.email} already exists in sheet`);
      return false;
    }

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Subscribers!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.name,
          data.email,
          data.subscribedAt || new Date().toISOString(),
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to add subscriber to Google Sheets:', error);
    return false;
  }
}

async function checkDuplicateEmail(email: string): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Subscribers!B:B', // Email column
    });

    const rows = response.data.values || [];
    return rows.some((row) => row[0]?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Failed to check duplicate email:', error);
    return false;
  }
}

export async function addLead(data: {
  name: string;
  email: string;
  phone?: string;
  eventName: string;
  eventDate: string;
  eventPrice: number;
  paymentStatus: string;
  createdAt?: string;
}): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Leads!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.name,
          data.email,
          data.phone || '',
          data.eventName,
          data.eventDate,
          data.eventPrice,
          data.paymentStatus,
          data.createdAt || new Date().toISOString(),
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to add lead to Google Sheets:', error);
    return false;
  }
}
