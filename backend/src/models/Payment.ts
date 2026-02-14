import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type PaymentStatus = 'pending' | 'succeeded' | 'cancelled';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  pricingId: mongoose.Types.ObjectId;
  yooPaymentId: string;
  amount: number;
  title: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pricingId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
    yooPaymentId: { type: String, default: '', sparse: true }, // unique when set (YooKassa id)
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    status: { type: String, enum: ['pending', 'succeeded', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>('Payment', paymentSchema);
