import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_APP_PASSWORD = process.env.SMTP_APP_PASSWORD ?? '';

export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_APP_PASSWORD.replace(/\s/g, ''),
  },
});

export const FROM_EMAIL = SMTP_USER || 'noreply@example.com';
export const FROM_NAME = process.env.SMTP_FROM_NAME ?? 'Busines';
