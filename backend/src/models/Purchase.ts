import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  pricingId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pricingId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  },
  { timestamps: true }
);

export const Purchase: Model<IPurchase> =
  mongoose.models.Purchase ?? mongoose.model<IPurchase>('Purchase', purchaseSchema);
