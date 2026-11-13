import mongoose, { Schema, type Types } from 'mongoose';

export type IJobApplication = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobVacancyId?: Types.ObjectId;
  company: string;
  position: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted';
  appliedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobVacancyId: { type: Schema.Types.ObjectId, ref: 'JobVacancy' },
    company: { type: String, required: true, maxlength: 200 },
    position: { type: String, required: true, maxlength: 200 },
    status: { type: String, enum: ['saved', 'applied', 'interview', 'offer', 'rejected', 'accepted'], default: 'saved' },
    appliedAt: { type: Date },
    notes: { type: String, maxlength: 3000 },
  },
  { timestamps: true },
);

jobApplicationSchema.index({ userId: 1, status: 1 });

export const JobApplication = (mongoose.models.JobApplication as mongoose.Model<IJobApplication>) || mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
