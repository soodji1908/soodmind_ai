import mongoose, { Schema, type Types } from 'mongoose';

export type ILead = {
  _id: Types.ObjectId;
  agentId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  budget?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const leadSchema = new Schema<ILead>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, maxlength: 255 },
    phone: { type: String, maxlength: 30 },
    source: { type: String, default: 'direct', maxlength: 50 },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
    budget: { type: Number, min: 0 },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

leadSchema.index({ agentId: 1, status: 1 });

export const Lead = (mongoose.models.Lead as mongoose.Model<ILead>) || mongoose.model<ILead>('Lead', leadSchema);
