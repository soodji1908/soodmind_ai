import mongoose, { Schema, type Types } from 'mongoose';

export type IEmailLog = {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  to: string;
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
  createdAt: Date;
};

const emailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: String, required: true, maxlength: 255 },
    subject: { type: String, required: true, maxlength: 200 },
    body: { type: String, maxlength: 50000 },
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    error: { type: String, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

emailLogSchema.index({ userId: 1, createdAt: -1 });

export const EmailLog = (mongoose.models.EmailLog as mongoose.Model<IEmailLog>) || mongoose.model<IEmailLog>('EmailLog', emailLogSchema);
