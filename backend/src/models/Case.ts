import mongoose, { Schema, type Document } from 'mongoose';

export interface ICase extends Document {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  content: string;
  problem?: string;
  solution?: string;
  results?: string;
  techStack: string[];
  imageUrl?: string;
  gallery: string[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    problem: { type: String, trim: true },
    solution: { type: String, trim: true },
    results: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Case = mongoose.models.Case ?? mongoose.model<ICase>('Case', caseSchema);
