import crypto from 'crypto';

const GRAPH_API_VERSION = 'v25.0';

type ActionSource = 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';

type UserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

type CustomData = {
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  orderId?: string;
};

type CapiEvent = {
  eventName: 'Lead' | 'InitiateCheckout' | 'Purchase' | 'CompleteRegistration' | 'Contact' | string;
  eventId: string;
  eventSourceUrl?: string;
  actionSource?: ActionSource;
  userData: UserData;
  customData?: CustomData;
  eventTime?: number;
};

const sha256 = (value: string): string =>
  crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

const normalizePhone = (phone: string): string => phone.replace(/[^\d]/g, '');

function buildUserData(u: UserData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (u.email) out.em = [sha256(u.email)];
  if (u.phone) out.ph = [sha256(normalizePhone(u.phone))];
  if (u.firstName) out.fn = [sha256(u.firstName)];
  if (u.lastName) out.ln = [sha256(u.lastName)];
  if (u.city) out.ct = [sha256(u.city)];
  if (u.country) out.country = [sha256(u.country)];
  if (u.fbp) out.fbp = u.fbp;
  if (u.fbc) out.fbc = u.fbc;
  if (u.clientIp) out.client_ip_address = u.clientIp;
  if (u.clientUserAgent) out.client_user_agent = u.clientUserAgent;
  return out;
}

function buildCustomData(c?: CustomData): Record<string, unknown> | undefined {
  if (!c) return undefined;
  const out: Record<string, unknown> = {};
  if (c.value !== undefined) out.value = c.value;
  if (c.currency) out.currency = c.currency;
  if (c.contentName) out.content_name = c.contentName;
  if (c.contentIds) out.content_ids = c.contentIds;
  if (c.contentType) out.content_type = c.contentType;
  if (c.numItems !== undefined) out.num_items = c.numItems;
  if (c.orderId) out.order_id = c.orderId;
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function sendCapiEvent(event: CapiEvent): Promise<{ ok: boolean; response?: unknown; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const appSecret = process.env.META_APP_SECRET;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return { ok: false, error: 'CAPI not configured (META_PIXEL_ID or META_ACCESS_TOKEN missing)' };
  }

  const appsecretProof = appSecret
    ? crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex')
    : undefined;

  const customData = buildCustomData(event.customData);
  const data = [{
    event_name: event.eventName,
    event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: event.eventId,
    action_source: event.actionSource ?? 'website',
    ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
    user_data: buildUserData(event.userData),
    ...(customData ? { custom_data: customData } : {}),
  }];

  const body = new URLSearchParams({
    data: JSON.stringify(data),
    access_token: accessToken,
    ...(appsecretProof ? { appsecret_proof: appsecretProof } : {}),
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  });

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('[CAPI] Error:', json);
      return { ok: false, error: JSON.stringify(json), response: json };
    }
    return { ok: true, response: json };
  } catch (err) {
    console.error('[CAPI] Network error:', err);
    return { ok: false, error: (err as Error).message };
  }
}

export function generateEventId(): string {
  return crypto.randomBytes(16).toString('hex');
}

type RequestLike = {
  headers: { get(name: string): string | null };
};

export function extractUserContext(req: RequestLike): Pick<UserData, 'fbp' | 'fbc' | 'clientIp' | 'clientUserAgent'> {
  const cookie = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookie.split(';').map((c) => c.trim().split('=').map(decodeURIComponent)),
  );

  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const clientIp = forwardedFor.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;

  return {
    fbp: cookies['_fbp'] || undefined,
    fbc: cookies['_fbc'] || undefined,
    clientIp,
    clientUserAgent: req.headers.get('user-agent') || undefined,
  };
}
