import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IContactRequest extends Document {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  userId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  },
  { timestamps: true }
);

export const ContactRequest: Model<IContactRequest> =
  mongoose.models.ContactRequest ?? mongoose.model<IContactRequest>('ContactRequest', contactRequestSchema);
