import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads/chat');
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch {}

/** Память: файл в req.file.buffer (для загрузки в Cloudinary или сохранения на диск). */
export const uploadChatImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|png|gif|webp)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Только изображения (JPEG, PNG, GIF, WebP)'));
  },
});

/** Для общего upload (картинки кейсов и т.д.) — тоже в память. */
export const uploadAnyImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|png|gif|webp)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Только изображения (JPEG, PNG, GIF, WebP)'));
  },
});

export const UPLOAD_CHAT_DIR = uploadDir;
