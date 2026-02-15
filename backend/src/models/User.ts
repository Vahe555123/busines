import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type UserRole = 'client' | 'manager' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface IUser extends Document {
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['client', 'manager', 'admin'], default: 'client' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', userSchema);
