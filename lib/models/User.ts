import mongoose, { Schema, type Types } from 'mongoose';

export type IUser = {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, default: '', maxlength: 120 },
    phone: { type: String, maxlength: 30 },
    avatarUrl: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ emailVerifyToken: 1 }, { sparse: true });

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema);
