import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ContactRequest } from '../models/ContactRequest.js';
import { Case } from '../models/Case.js';
import { AppError } from '../utils/AppError.js';
import { sendContactReceivedEmail } from '../services/mailService.js';
import { sendContactNotification } from '../services/telegramService.js';

export async function createContactRequest(req: Request, res: Response): Promise<void> {
  const user = req.user;
  const body = req.body as {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    message?: string;
    caseId?: string;
  };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name) throw new AppError('Укажите имя', 400);
  if (!email) throw new AppError('Укажите email', 400);
  if (!message) throw new AppError('Укажите сообщение', 400);

  let caseId: mongoose.Types.ObjectId | undefined;
  let caseTitle: string | undefined;
  if (body.caseId) {
    const caseDoc = await Case.findById(body.caseId).select('title').lean();
    if (caseDoc) {
      caseId = caseDoc._id as mongoose.Types.ObjectId;
      caseTitle = (caseDoc as { title: string }).title;
    }
  }

  const doc = await ContactRequest.create({
    name,
    email,
    company: typeof body.company === 'string' ? body.company.trim() : undefined,
    phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
    message,
    userId: user?._id,
    caseId,
  });

  sendContactReceivedEmail(email, name).catch((e) =>
    console.error('[Mail] Contact received email failed:', e)
  );
  sendContactNotification({
    name,
    email,
    company: doc.company,
    phone: doc.phone,
    message,
    requestId: (doc._id as { toString(): string }).toString(),
    createdAt: doc.createdAt as Date,
    caseTitle,
  }).catch((e) => console.error('[Telegram] Contact notification failed:', e));

  res.status(201).json(doc);
}

export async function getMyContactRequests(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw new AppError('Требуется авторизация', 401);

  const list = await ContactRequest.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(list);
}

export async function getAllContactRequests(req: Request, res: Response): Promise<void> {
  const list = await ContactRequest.find()
    .sort({ createdAt: -1 })
    .lean()
    .populate('userId', 'email name');
  res.json(list);
}
