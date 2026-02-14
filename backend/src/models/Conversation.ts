import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IConversation extends Document {
  sessionId?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    sessionId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

conversationSchema.index({ sessionId: 1, userId: 1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ?? mongoose.model<IConversation>('Conversation', conversationSchema);
