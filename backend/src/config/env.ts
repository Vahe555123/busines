import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ?? '3001',
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/busines',
} as const;
