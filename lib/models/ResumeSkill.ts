import mongoose, { Schema, type Types } from 'mongoose';

export type IResumeSkill = {
  _id: Types.ObjectId;
  resumeId: Types.ObjectId;
  userId: Types.ObjectId;
  skillName: string;
  category?: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  createdAt: Date;
};

const resumeSkillSchema = new Schema<IResumeSkill>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true, maxlength: 100 },
    category: { type: String, maxlength: 50 },
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

resumeSkillSchema.index({ resumeId: 1 });
resumeSkillSchema.index({ userId: 1, skillName: 1 });

export const ResumeSkill = (mongoose.models.ResumeSkill as mongoose.Model<IResumeSkill>) || mongoose.model<IResumeSkill>('ResumeSkill', resumeSkillSchema);
