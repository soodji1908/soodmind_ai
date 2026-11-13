import mongoose, { Schema, type Types } from 'mongoose';

export type IJobDescription = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  company?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const jobDescriptionSchema = new Schema<IJobDescription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 200 },
    company: { type: String, maxlength: 200 },
    content: { type: String, required: true, maxlength: 50000 },
  },
  { timestamps: true },
);

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

export const JobDescription = (mongoose.models.JobDescription as mongoose.Model<IJobDescription>) || mongoose.model<IJobDescription>('JobDescription', jobDescriptionSchema);
