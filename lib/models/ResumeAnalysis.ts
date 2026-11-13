import mongoose, { Schema, type Types } from 'mongoose';

export type IResumeAnalysis = {
  _id: Types.ObjectId;
  resumeId: Types.ObjectId;
  userId: Types.ObjectId;
  atsScore: number;
  maxScore: number;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    pointsAwarded: number;
    maxPoints: number;
    explanation: string;
  }>;
  skills: string[];
  sectionsFound: string[];
  wordCount: number;
  experienceYears: number | null;
  jobMatch?: {
    similarity: number;
    matchedSkills: string[];
    missingSkills: string[];
    keywordGaps: string[];
  };
  createdAt: Date;
  updatedAt: Date;
};

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    atsScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    checks: [{
      id: String,
      label: String,
      passed: Boolean,
      pointsAwarded: Number,
      maxPoints: Number,
      explanation: String,
    }],
    skills: [String],
    sectionsFound: [String],
    wordCount: Number,
    experienceYears: { type: Number, default: null },
    jobMatch: {
      similarity: Number,
      matchedSkills: [String],
      missingSkills: [String],
      keywordGaps: [String],
    },
  },
  { timestamps: true },
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });
resumeAnalysisSchema.index({ resumeId: 1 });

export const ResumeAnalysis = (mongoose.models.ResumeAnalysis as mongoose.Model<IResumeAnalysis>) || mongoose.model<IResumeAnalysis>('ResumeAnalysis', resumeAnalysisSchema);
