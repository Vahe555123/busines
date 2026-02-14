import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  imageUrls: string[];
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, default: '' },
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

export const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ?? mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
