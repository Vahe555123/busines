import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type LocalizedString = { en?: string; ru?: string; hy?: string };
export type LocalizedArray = { en?: string[]; ru?: string[]; hy?: string[] };

export interface IPricing extends Document {
  title: LocalizedString;
  description: LocalizedString;
  price: number;
  order: number;
  features?: LocalizedArray;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const localizedStringSchema = new Schema(
  {
    en: { type: String, trim: true },
    ru: { type: String, trim: true },
    hy: { type: String, trim: true },
  },
  { _id: false }
);

const localizedArraySchema = new Schema(
  {
    en: [{ type: String, trim: true }],
    ru: [{ type: String, trim: true }],
    hy: [{ type: String, trim: true }],
  },
  { _id: false }
);

const pricingSchema = new Schema<IPricing>(
  {
    title: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    order: { type: Number, default: 0 },
    features: { type: localizedArraySchema },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Pricing: Model<IPricing> =
  mongoose.models.Pricing ?? mongoose.model<IPricing>('Pricing', pricingSchema);

export type SupportedLocale = 'en' | 'ru' | 'hy';

export function getLocalized(
  obj: LocalizedString | LocalizedArray | undefined,
  lang: SupportedLocale
): string | string[] {
  if (!obj || typeof obj !== 'object') return lang === 'hy' ? '' : '';
  const v = (obj as Record<string, unknown>)[lang];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v;
  const fallback = (obj as Record<string, unknown>).en ?? (obj as Record<string, unknown>).ru ?? (obj as Record<string, unknown>).hy;
  return Array.isArray(fallback) ? fallback : (fallback as string) ?? '';
}
