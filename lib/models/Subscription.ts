import mongoose, { Schema, type Types } from 'mongoose';

export type ISubscription = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate?: Date;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired', 'past_due'], default: 'active' },
    startDate: { type: Date, default: () => new Date() },
    endDate: { type: Date },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = (mongoose.models.Subscription as mongoose.Model<ISubscription>) || mongoose.model<ISubscription>('Subscription', subscriptionSchema);
