import mongoose, { Schema, type Types } from 'mongoose';

export type IJobMatch = {
  _id: Types.ObjectId;
  resumeId: Types.ObjectId;
  jobDescriptionId?: Types.ObjectId;
  userId: Types.ObjectId;
  similarity: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  createdAt: Date;
  updatedAt: Date;
};

const jobMatchSchema = new Schema<IJobMatch>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    similarity: { type: Number, required: true, min: 0, max: 1 },
    matchedSkills: [String],
    missingSkills: [String],
    keywordGaps: [String],
  },
  { timestamps: true },
);

jobMatchSchema.index({ userId: 1, createdAt: -1 });

export const JobMatch = (mongoose.models.JobMatch as mongoose.Model<IJobMatch>) || mongoose.model<IJobMatch>('JobMatch', jobMatchSchema);
