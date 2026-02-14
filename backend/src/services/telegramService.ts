const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? '';

export type PurchaseLogPayload = {
  userEmail: string;
  userName?: string;
  productTitle: string;
  price: number;
  purchaseId: string;
  createdAt: Date;
};

export async function sendPurchaseNotification(payload: PurchaseLogPayload): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skip notification');
    return;
  }

  const date = new Date(payload.createdAt).toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const nameLine = payload.userName ? `👤 <b>Имя:</b> ${escapeHtml(payload.userName)}\n` : '';
  const text = [
    '🛒 <b>Новая покупка</b>',
    '',
    `${nameLine}📧 <b>Email:</b> ${escapeHtml(payload.userEmail)}`,
    `📦 <b>Товар:</b> ${escapeHtml(payload.productTitle)}`,
    `💰 <b>Сумма:</b> ${payload.price.toLocaleString('ru-RU')} ₽`,
    `🆔 <b>ID заказа:</b> <code>${payload.purchaseId}</code>`,
    `📅 <b>Дата:</b> ${date}`,
  ]
    .filter(Boolean)
    .join('\n');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Telegram] sendMessage failed:', res.status, err);
    throw new Error(`Telegram: ${res.status}`);
  }
}

export type ContactLogPayload = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  requestId: string;
  createdAt: Date;
  isFromUser?: boolean;
  caseTitle?: string;
};

export async function sendContactNotification(payload: ContactLogPayload): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skip notification');
    return;
  }

  const date = new Date(payload.createdAt).toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const lines = [
    payload.caseTitle ? '📩 <b>Заказ услуги по кейсу</b>' : '📩 <b>Новая заявка с сайта</b>',
    '',
    ...(payload.caseTitle ? [`📦 <b>Кейс:</b> ${escapeHtml(payload.caseTitle)}`, ''] : []),
    `👤 <b>Имя:</b> ${escapeHtml(payload.name)}`,
    `📧 <b>Email:</b> ${escapeHtml(payload.email)}`,
    ...(payload.company ? [`🏢 <b>Компания:</b> ${escapeHtml(payload.company)}`] : []),
    ...(payload.phone ? [`📞 <b>Телефон:</b> ${escapeHtml(payload.phone)}`] : []),
    `💬 <b>Сообщение:</b>\n${escapeHtml(payload.message.slice(0, 500))}${payload.message.length > 500 ? '…' : ''}`,
    `🆔 <b>ID:</b> <code>${payload.requestId}</code>`,
    `📅 <b>Дата:</b> ${date}`,
  ];
  const text = lines.join('\n');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Telegram] sendMessage failed:', res.status, err);
    throw new Error(`Telegram: ${res.status}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
