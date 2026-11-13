import mongoose, { Schema, type Types } from 'mongoose';

export type IJobVacancy = {
  _id: Types.ObjectId;
  recruiterId: Types.ObjectId;
  tenantId?: Types.ObjectId;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'remote' | 'hybrid';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  status: 'draft' | 'active' | 'closed' | 'filled';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

const jobVacancySchema = new Schema<IJobVacancy>(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId },
    title: { type: String, required: true, maxlength: 200 },
    company: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 50000 },
    requirements: [String],
    location: { type: String, maxlength: 200 },
    jobType: { type: String, enum: ['full_time', 'part_time', 'contract', 'remote', 'hybrid'], default: 'full_time' },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
    status: { type: String, enum: ['draft', 'active', 'closed', 'filled'], default: 'draft' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

jobVacancySchema.index({ recruiterId: 1, status: 1 });
jobVacancySchema.index({ tenantId: 1, status: 1 });
jobVacancySchema.index({ title: 'text', description: 'text' });

export const JobVacancy = (mongoose.models.JobVacancy as mongoose.Model<IJobVacancy>) || mongoose.model<IJobVacancy>('JobVacancy', jobVacancySchema);
