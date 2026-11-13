import mongoose, { Schema, type Types } from 'mongoose';

export type IMlModel = {
  _id: Types.ObjectId;
  name: string;
  type: 'house_price' | 'resume_analysis' | 'job_match' | 'skill_extraction';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const mlModelSchema = new Schema<IMlModel>(
  {
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, enum: ['house_price', 'resume_analysis', 'job_match', 'skill_extraction'] },
    description: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

mlModelSchema.index({ type: 1, isActive: 1 });

export const MlModel = (mongoose.models.MlModel as mongoose.Model<IMlModel>) || mongoose.model<IMlModel>('MlModel', mlModelSchema);
