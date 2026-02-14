import { mailTransporter, FROM_EMAIL, FROM_NAME } from '../config/mail.js';

const CODE_EXPIRES_MINUTES = 15;

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getVerificationExpires(): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + CODE_EXPIRES_MINUTES);
  return date;
}

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  await mailTransporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Подтверждение почты — код верификации',
    text: `Ваш код подтверждения: ${code}. Код действителен ${CODE_EXPIRES_MINUTES} минут.`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px;">
        <h2>Подтверждение почты</h2>
        <p>Ваш код подтверждения:</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">${code}</p>
        <p style="color: #666;">Код действителен ${CODE_EXPIRES_MINUTES} минут.</p>
      </div>
    `,
  });
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  productTitle: string,
  price: number,
  userName?: string
): Promise<void> {
  const name = userName ? `, ${userName}` : '';
  const subject = 'Поздравляем с покупкой!';
  const text = `Здравствуйте${name}! Спасибо за покупку. Вы оформили: ${productTitle} (${price.toLocaleString('ru-RU')} ₽). Наши специалисты свяжутся с вами в ближайшее время.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; line-height: 1.5;">
      <h2 style="color: #333;">🎉 Поздравляем с покупкой!</h2>
      <p>Здравствуйте${name}!</p>
      <p>Спасибо, что выбрали нас. Вы успешно оформили заказ:</p>
      <p style="background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
        <strong>${productTitle}</strong><br/>
        <span style="color: #666;">Сумма: ${price.toLocaleString('ru-RU')} ₽</span>
      </p>
      <p><strong>Наши специалисты свяжутся с вами в ближайшее время</strong> для уточнения деталей.</p>
      <p style="color: #666; font-size: 14px;">Если у вас есть вопросы — просто ответьте на это письмо.</p>
    </div>
  `;
  await mailTransporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}

export async function sendContactReceivedEmail(to: string, userName?: string): Promise<void> {
  const name = userName ? `, ${userName}` : '';
  const subject = 'Мы получили ваше сообщение';
  const text = `Здравствуйте${name}! Спасибо за обращение. Мы получили вашу заявку и свяжемся с вами в ближайшее время.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; line-height: 1.5;">
      <h2 style="color: #333;">✉️ Мы получили ваше сообщение</h2>
      <p>Здравствуйте${name}!</p>
      <p>Спасибо за обращение. Ваша заявка принята в работу.</p>
      <p><strong>Мы свяжемся с вами в ближайшее время.</strong></p>
      <p style="color: #666; font-size: 14px;">Если у вас срочный вопрос — ответьте на это письмо.</p>
    </div>
  `;
  await mailTransporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}
