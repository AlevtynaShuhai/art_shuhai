const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TelegramMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
}

async function sendTelegramMessage(
  text: string,
  options: TelegramMessageOptions = { parse_mode: 'HTML' }
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          ...options,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export interface OrderNotificationData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventPrice: number;
  eventLocation: string;
}

export async function sendNewOrderNotification(data: OrderNotificationData) {
  const message = `
🎨 <b>Новая заявка на курс!</b>

👤 <b>Клиент:</b> ${escapeHtml(data.name)}
📧 <b>Email:</b> ${escapeHtml(data.email)}
📱 <b>Телефон:</b> ${data.phone ? escapeHtml(data.phone) : 'Не указан'}

🖼 <b>Курс:</b> ${escapeHtml(data.eventName)}
📅 <b>Дата:</b> ${escapeHtml(data.eventDate)}
🕐 <b>Время:</b> ${escapeHtml(data.eventTime)}
💰 <b>Цена:</b> $${data.eventPrice} CAD
📍 <b>Локация:</b> ${escapeHtml(data.eventLocation)}

${data.message ? `💬 <b>Сообщение:</b>\n${escapeHtml(data.message)}` : ''}

⏳ <i>Ожидание оплаты...</i>
`.trim();

  return sendTelegramMessage(message);
}

export async function sendPaymentSuccessNotification(data: OrderNotificationData) {
  const message = `
✅ <b>Оплата получена!</b>

👤 <b>Клиент:</b> ${escapeHtml(data.name)}
📧 <b>Email:</b> ${escapeHtml(data.email)}

🖼 <b>Курс:</b> ${escapeHtml(data.eventName)}
📅 <b>Дата:</b> ${escapeHtml(data.eventDate)}
💰 <b>Сумма:</b> $${data.eventPrice} CAD

🎉 <i>Клиент зарегистрирован!</i>
`.trim();

  return sendTelegramMessage(message);
}

export interface ContactFormNotificationData {
  name: string;
  email: string;
  message: string;
}

export async function sendContactFormNotification(data: ContactFormNotificationData) {
  const message = `
📩 <b>Новое сообщение с сайта!</b>

👤 <b>Имя:</b> ${escapeHtml(data.name)}
📧 <b>Email:</b> ${escapeHtml(data.email)}

💬 <b>Сообщение:</b>
${escapeHtml(data.message)}
`.trim();

  return sendTelegramMessage(message);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
