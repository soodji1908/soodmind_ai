import mongoose, { Schema, type Types } from 'mongoose';

export type IInvoice = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  dueDate: Date;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  createdAt: Date;
  updatedAt: Date;
};

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    number: { type: String, required: true, unique: true, maxlength: 50 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'void'], default: 'draft' },
    dueDate: { type: Date },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
    }],
  },
  { timestamps: true },
);

invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ number: 1 }, { unique: true });

export const Invoice = (mongoose.models.Invoice as mongoose.Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', invoiceSchema);
