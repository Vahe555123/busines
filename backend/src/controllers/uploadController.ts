import type { Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { uploadImageBuffer } from '../services/cloudinaryService.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Загрузка одной картинки в Cloudinary (папка busines/cases).
 * Для админки: кейсы (imageUrl, галерея) и т.д.
 * Body: multipart, поле "image".
 */
export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary не настроен. Добавьте CLOUDINARY_* в .env', 503);
  }
  if (!req.file || !req.file.buffer) {
    throw new AppError('Файл не загружен. Отправьте multipart с полем "image".', 400);
  }
  const url = await uploadImageBuffer(req.file.buffer, 'cases');
  res.json({ url });
}
