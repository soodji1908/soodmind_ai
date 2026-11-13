import mongoose, { Schema, type Types } from 'mongoose';

export type ISupportTicket = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  portal: string;
  createdAt: Date;
  updatedAt: Date;
};

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    portal: { type: String, maxlength: 20 },
  },
  { timestamps: true },
);

supportTicketSchema.index({ userId: 1, status: 1 });

export const SupportTicket = (mongoose.models.SupportTicket as mongoose.Model<ISupportTicket>) || mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
