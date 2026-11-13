import mongoose, { Schema, type Types } from 'mongoose';

export type ILoginActivity = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  portal: string;
  event: 'login_success' | 'login_denied' | 'logout';
  userAgent?: string;
  createdAt: Date;
};

const loginActivitySchema = new Schema<ILoginActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    portal: { type: String, required: true },
    event: { type: String, required: true, enum: ['login_success', 'login_denied', 'logout'] },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

loginActivitySchema.index({ userId: 1, createdAt: -1 });
loginActivitySchema.index({ createdAt: -1 });

export const LoginActivity = (mongoose.models.LoginActivity as mongoose.Model<ILoginActivity>) || mongoose.model<ILoginActivity>('LoginActivity', loginActivitySchema);
