import type { UploadApiResponse } from 'cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

const FOLDER = 'busines';

/**
 * Загрузка изображения из буфера в Cloudinary.
 * @param buffer — содержимое файла
 * @param subfolder — подпапка (chat, cases и т.д.)
 * @param publicIdPrefix — опциональный префикс для public_id
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  subfolder: string,
  publicIdPrefix?: string
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary не настроен. Укажите CLOUDINARY_* в .env', 503);
  }

  const folder = `${FOLDER}/${subfolder}`;
  const publicId = publicIdPrefix
    ? `${publicIdPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    : undefined;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...(publicId ? { public_id: publicId } : {}),
      },
      (err: Error | undefined, result: UploadApiResponse | undefined) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error('Cloudinary не вернул URL'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
