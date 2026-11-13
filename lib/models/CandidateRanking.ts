import mongoose, { Schema, type Types } from 'mongoose';

export type ICandidateRanking = {
  _id: Types.ObjectId;
  recruiterId: Types.ObjectId;
  jobVacancyId?: Types.ObjectId;
  candidateId: Types.ObjectId;
  rank: number;
  score: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const candidateRankingSchema = new Schema<ICandidateRanking>(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobVacancyId: { type: Schema.Types.ObjectId, ref: 'JobVacancy' },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rank: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

candidateRankingSchema.index({ recruiterId: 1, rank: 1 });
candidateRankingSchema.index({ jobVacancyId: 1, rank: 1 });

export const CandidateRanking = (mongoose.models.CandidateRanking as mongoose.Model<ICandidateRanking>) || mongoose.model<ICandidateRanking>('CandidateRanking', candidateRankingSchema);
