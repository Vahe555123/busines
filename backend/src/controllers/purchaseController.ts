import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Purchase } from '../models/Purchase.js';
import { Payment } from '../models/Payment.js';
import { Pricing, type LocalizedString } from '../models/Pricing.js';
import { AppError } from '../utils/AppError.js';
import { sendPurchaseConfirmationEmail } from '../services/mailService.js';
import { sendPurchaseNotification } from '../services/telegramService.js';
import { createPayment as createYooPayment, isYooConfigured } from '../services/yookassaService.js';
import { emitPaymentSucceeded } from '../socket.js';

function titleString(title: LocalizedString | undefined): string {
  if (!title || typeof title !== 'object') return 'Тариф';
  const t = title as { en?: string; ru?: string; hy?: string };
  return t.ru || t.en || t.hy || 'Тариф';
}

export async function createPurchase(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw new AppError('Требуется авторизация', 401);

  const { pricingId } = req.body as { pricingId?: string };
  if (!pricingId) throw new AppError('Укажите pricingId', 400);

  const pricing = await Pricing.findById(pricingId);
  if (!pricing) throw new AppError('Тариф не найден', 404);

  const productTitle = titleString(pricing.title as LocalizedString);

  const purchase = await Purchase.create({
    userId: user._id,
    pricingId: pricing._id,
    title: productTitle,
    price: pricing.price,
    status: 'completed',
  });

  sendPurchaseConfirmationEmail(user.email, productTitle, pricing.price, user.name).catch((e) =>
    console.error('[Mail] Purchase confirmation failed:', e)
  );
  sendPurchaseNotification({
    userEmail: user.email,
    userName: user.name,
    productTitle,
    price: pricing.price,
    purchaseId: (purchase._id as { toString(): string }).toString(),
    createdAt: purchase.createdAt as Date,
  }).catch((e) => console.error('[Telegram] Purchase notification failed:', e));

  res.status(201).json(purchase);
}

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

export async function createPayment(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw new AppError('Требуется авторизация', 401);
  if (!isYooConfigured()) throw new AppError('Оплата через ЮKassa не настроена', 503);

  const { pricingId } = req.body as { pricingId?: string };
  if (!pricingId) throw new AppError('Укажите pricingId', 400);

  const pricing = await Pricing.findById(pricingId);
  if (!pricing) throw new AppError('Тариф не найден', 404);

  const productTitle = titleString(pricing.title as LocalizedString);
  const idempotenceKey = uuidv4();

  const payment = await Payment.create({
    userId: user._id,
    pricingId: pricing._id,
    yooPaymentId: '',
    amount: pricing.price,
    title: productTitle,
    status: 'pending',
  });
  const returnUrl = `${FRONTEND_URL}/payment/return?paymentId=${(payment._id as { toString(): string }).toString()}`;

  const yoo = await createYooPayment({
    amount: pricing.price,
    returnUrl,
    description: productTitle,
    idempotenceKey,
  });
  payment.yooPaymentId = yoo.id;
  await payment.save();

  res.status(201).json({
    paymentId: (payment._id as { toString(): string }).toString(),
    confirmationUrl: yoo.confirmationUrl,
  });
}

export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw new AppError('Требуется авторизация', 401);
  const paymentId = req.params.paymentId;
  const payment = await Payment.findOne({ _id: paymentId, userId: user._id }).lean();
  if (!payment) throw new AppError('Платёж не найден', 404);
  res.json({
    paymentId: payment._id.toString(),
    status: payment.status,
    amount: payment.amount,
    title: payment.title,
  });
}

type YooWebhookPayload = {
  type?: string;
  event?: string;
  object?: { id?: string; status?: string };
};

export async function yooWebhook(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const body = req.body as YooWebhookPayload;
  if (body.type !== 'notification' || body.event !== 'payment.succeeded' || !body.object?.id) {
    res.status(200).send('ok');
    return;
  }
  const yooPaymentId = body.object.id;
  const payment = await Payment.findOne({ yooPaymentId, status: 'pending' });
  if (!payment) {
    res.status(200).send('ok');
    return;
  }
  payment.status = 'succeeded';
  await payment.save();

  const productTitle = payment.title;
  const price = payment.amount;
  const purchase = await Purchase.create({
    userId: payment.userId,
    pricingId: payment.pricingId,
    title: productTitle,
    price,
    status: 'completed',
  });

  const User = (await import('../models/User.js')).User;
  const user = await User.findById(payment.userId).lean();
  if (user) {
    sendPurchaseConfirmationEmail(user.email, productTitle, price, user.name).catch((e) =>
      console.error('[Mail] Purchase confirmation failed:', e)
    );
    sendPurchaseNotification({
      userEmail: user.email,
      userName: user.name,
      productTitle,
      price,
      purchaseId: (purchase._id as { toString(): string }).toString(),
      createdAt: purchase.createdAt as Date,
    }).catch((e) => console.error('[Telegram] Purchase notification failed:', e));
    emitPaymentSucceeded((payment.userId as { toString(): string }).toString(), {
      paymentId: (payment._id as { toString(): string }).toString(),
      purchaseId: (purchase._id as { toString(): string }).toString(),
    });
  }

  res.status(200).send('ok');
}

export async function getMyPurchases(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw new AppError('Требуется авторизация', 401);

  const purchases = await Purchase.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(purchases);
}

export async function getPurchasesByUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId;
  const purchases = await Purchase.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(purchases);
}

export async function updatePurchaseStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  const valid = ['pending', 'completed', 'cancelled'];
  if (!status || !valid.includes(status)) {
    throw new AppError('Укажите статус: pending, completed или cancelled', 400);
  }
  const purchase = await Purchase.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!purchase) throw new AppError('Покупка не найдена', 404);
  res.json(purchase);
}
