import type { Request, Response } from 'express';
import { Pricing, getLocalized, type SupportedLocale, type LocalizedString, type LocalizedArray } from '../models/Pricing.js';
import { AppError } from '../utils/AppError.js';

const LANGS: SupportedLocale[] = ['en', 'ru', 'hy'];

function parseBody(body: Record<string, unknown>) {
  const title = body.title as LocalizedString | undefined;
  const description = body.description as LocalizedString | undefined;
  const features = body.features as LocalizedArray | undefined;
  const price = body.price as number | undefined;
  const order = body.order as number | undefined;
  const isPopular = body.isPopular as boolean | undefined;
  return { title, description, features, price, order, isPopular };
}

function toLocalizedItem(doc: Record<string, unknown>, lang: SupportedLocale) {
  return {
    _id: (doc._id as { toString(): string })?.toString?.(),
    title: getLocalized(doc.title as LocalizedString, lang),
    description: getLocalized(doc.description as LocalizedString, lang),
    features: getLocalized(doc.features as LocalizedArray, lang) as string[],
    price: doc.price,
    order: doc.order,
    isPopular: doc.isPopular,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listPricing(req: Request, res: Response): Promise<void> {
  const lang = (req.query.lang as SupportedLocale) || 'en';
  const validLang = LANGS.includes(lang) ? lang : 'en';
  const items = await Pricing.find().sort({ order: 1 }).lean();
  const localized = items.map((doc) => toLocalizedItem(doc as Record<string, unknown>, validLang));
  res.json(localized);
}

export async function getPricing(req: Request, res: Response): Promise<void> {
  const item = await Pricing.findById(req.params.id).lean();
  if (!item) {
    throw new AppError('Тариф не найден', 404);
  }
  if (req.query.raw === '1') {
    res.json(item);
    return;
  }
  const lang = (req.query.lang as SupportedLocale) || 'en';
  const validLang = LANGS.includes(lang) ? lang : 'en';
  res.json(toLocalizedItem(item as Record<string, unknown>, validLang));
}

export async function createPricing(req: Request, res: Response): Promise<void> {
  const { title, description, features, price, order, isPopular } = parseBody(req.body as Record<string, unknown>);
  if (!title || (typeof title === 'object' && !title.en && !title.ru && !title.hy)) {
    throw new AppError('Название обязательно (хотя бы на одном языке)', 400);
  }
  if (typeof price !== 'number' || price < 0) {
    throw new AppError('Укажите корректную цену', 400);
  }
  const item = await Pricing.create({
    title: title || { en: '', ru: '', hy: '' },
    description: description || { en: '', ru: '', hy: '' },
    price: Number(price),
    order: Number(order) || 0,
    features: features || { en: [], ru: [], hy: [] },
    isPopular: Boolean(isPopular),
  });
  res.status(201).json(item);
}

export async function updatePricing(req: Request, res: Response): Promise<void> {
  const item = await Pricing.findById(req.params.id);
  if (!item) {
    throw new AppError('Тариф не найден', 404);
  }
  const { title, description, features, price, order, isPopular } = parseBody(req.body as Record<string, unknown>);
  if (title !== undefined) item.title = { ...item.title, ...title };
  if (description !== undefined) item.description = { ...item.description, ...description };
  if (features !== undefined) item.features = { ...item.features, ...features };
  if (typeof price === 'number' && price >= 0) item.price = price;
  if (order !== undefined) item.order = Number(order);
  if (typeof isPopular === 'boolean') item.isPopular = isPopular;
  await item.save();
  res.json(item);
}

export async function deletePricing(req: Request, res: Response): Promise<void> {
  const item = await Pricing.findByIdAndDelete(req.params.id);
  if (!item) {
    throw new AppError('Тариф не найден', 404);
  }
  res.status(204).send();
}
