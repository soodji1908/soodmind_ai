import mongoose, { Schema, type Types } from 'mongoose';

export type IRecruiter = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  company: string;
  industry?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
};

const recruiterSchema = new Schema<IRecruiter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, maxlength: 200 },
    industry: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 300 },
  },
  { timestamps: true },
);

recruiterSchema.index({ userId: 1 });

export const Recruiter = (mongoose.models.Recruiter as mongoose.Model<IRecruiter>) || mongoose.model<IRecruiter>('Recruiter', recruiterSchema);
