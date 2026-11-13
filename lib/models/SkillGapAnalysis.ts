import mongoose, { Schema, type Types } from 'mongoose';

export type ISkillGapAnalysis = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currentSkills: string[];
  targetRole: string;
  gaps: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
};

const skillGapAnalysisSchema = new Schema<ISkillGapAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentSkills: [String],
    targetRole: { type: String, required: true, maxlength: 100 },
    gaps: [String],
    recommendations: [String],
  },
  { timestamps: true },
);

skillGapAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const SkillGapAnalysis = (mongoose.models.SkillGapAnalysis as mongoose.Model<ISkillGapAnalysis>) || mongoose.model<ISkillGapAnalysis>('SkillGapAnalysis', skillGapAnalysisSchema);
