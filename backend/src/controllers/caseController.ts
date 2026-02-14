import type { Request, Response } from 'express';
import { Case } from '../models/Case.js';
import { AppError } from '../utils/AppError.js';

export async function listCases(req: Request, res: Response): Promise<void> {
  const list = await Case.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .select('title slug category shortDescription imageUrl order createdAt')
    .lean();
  res.json(list);
}

export async function getCase(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const doc = await Case.findOne(
    id.length === 24 && /^[a-f0-9]+$/i.test(id) ? { _id: id, isPublished: true } : { slug: id, isPublished: true }
  ).lean();
  if (!doc) throw new AppError('Кейс не найден', 404);
  res.json(doc);
}

export async function listCasesAdmin(req: Request, res: Response): Promise<void> {
  const list = await Case.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json(list);
}

export async function getCaseAdmin(req: Request, res: Response): Promise<void> {
  const doc = await Case.findById(req.params.id).lean();
  if (!doc) throw new AppError('Кейс не найден', 404);
  res.json(doc);
}

export async function createCase(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const slug =
    typeof body.slug === 'string'
      ? body.slug.trim().toLowerCase().replace(/\s+/g, '-')
      : undefined;
  if (!slug) throw new AppError('Укажите slug', 400);

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const shortDescription = typeof body.shortDescription === 'string' ? body.shortDescription.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';

  if (!title) throw new AppError('Укажите название', 400);
  if (!category) throw new AppError('Укажите категорию', 400);
  if (!shortDescription) throw new AppError('Укажите краткое описание', 400);
  if (!content) throw new AppError('Укажите контент', 400);

  const existing = await Case.findOne({ slug });
  if (existing) throw new AppError('Кейс с таким slug уже есть', 400);

  const doc = await Case.create({
    title,
    slug,
    category,
    shortDescription,
    content,
    problem: typeof body.problem === 'string' ? body.problem.trim() : undefined,
    solution: typeof body.solution === 'string' ? body.solution.trim() : undefined,
    results: typeof body.results === 'string' ? body.results.trim() : undefined,
    techStack: Array.isArray(body.techStack) ? body.techStack.filter((s): s is string => typeof s === 'string') : [],
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined,
    gallery: Array.isArray(body.gallery) ? body.gallery.filter((s): s is string => typeof s === 'string') : [],
    order: typeof body.order === 'number' ? body.order : 0,
    isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : true,
  });
  res.status(201).json(doc);
}

export async function updateCase(req: Request, res: Response): Promise<void> {
  const doc = await Case.findById(req.params.id);
  if (!doc) throw new AppError('Кейс не найден', 404);

  const body = req.body as Record<string, unknown>;
  if (typeof body.title === 'string') doc.title = body.title.trim();
  if (typeof body.slug === 'string') {
    const slug = body.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (slug !== doc.slug) {
      const existing = await Case.findOne({ slug });
      if (existing) throw new AppError('Кейс с таким slug уже есть', 400);
      doc.slug = slug;
    }
  }
  if (typeof body.category === 'string') doc.category = body.category.trim();
  if (typeof body.shortDescription === 'string') doc.shortDescription = body.shortDescription.trim();
  if (typeof body.content === 'string') doc.content = body.content;
  if (body.problem !== undefined) doc.problem = typeof body.problem === 'string' ? body.problem.trim() : undefined;
  if (body.solution !== undefined) doc.solution = typeof body.solution === 'string' ? body.solution.trim() : undefined;
  if (body.results !== undefined) doc.results = typeof body.results === 'string' ? body.results.trim() : undefined;
  if (Array.isArray(body.techStack)) doc.techStack = body.techStack.filter((s): s is string => typeof s === 'string');
  if (body.imageUrl !== undefined) doc.imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined;
  if (Array.isArray(body.gallery)) doc.gallery = body.gallery.filter((s): s is string => typeof s === 'string');
  if (typeof body.order === 'number') doc.order = body.order;
  if (typeof body.isPublished === 'boolean') doc.isPublished = body.isPublished;

  await doc.save();
  res.json(doc);
}

export async function deleteCase(req: Request, res: Response): Promise<void> {
  const doc = await Case.findByIdAndDelete(req.params.id);
  if (!doc) throw new AppError('Кейс не найден', 404);
  res.status(204).send();
}
