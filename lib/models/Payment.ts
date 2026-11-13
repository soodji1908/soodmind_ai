import mongoose, { Schema, type Types } from 'mongoose';

export type IPayment = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  method: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, maxlength: 50 },
    transactionId: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = (mongoose.models.Payment as mongoose.Model<IPayment>) || mongoose.model<IPayment>('Payment', paymentSchema);
