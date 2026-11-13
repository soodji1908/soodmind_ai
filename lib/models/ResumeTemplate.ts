import mongoose, { Schema, type Types } from 'mongoose';

export type IResumeTemplate = {
  _id: Types.ObjectId;
  name: string;
  category: string;
  content: Record<string, unknown>;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const resumeTemplateSchema = new Schema<IResumeTemplate>(
  {
    name: { type: String, required: true, maxlength: 120 },
    category: { type: String, maxlength: 50 },
    content: { type: Schema.Types.Mixed, default: {} },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true },
);

resumeTemplateSchema.index({ category: 1 });

export const ResumeTemplate = (mongoose.models.ResumeTemplate as mongoose.Model<IResumeTemplate>) || mongoose.model<IResumeTemplate>('ResumeTemplate', resumeTemplateSchema);
