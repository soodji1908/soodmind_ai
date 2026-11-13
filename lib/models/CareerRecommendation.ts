import mongoose, { Schema, type Types } from 'mongoose';

export type ICareerRecommendation = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  recommendation: string;
  category: string;
  confidence: number;
  createdAt: Date;
};

const careerRecommendationSchema = new Schema<ICareerRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recommendation: { type: String, required: true, maxlength: 500 },
    category: { type: String, maxlength: 50 },
    confidence: { type: Number, default: 0, min: 0, max: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

careerRecommendationSchema.index({ userId: 1, createdAt: -1 });

export const CareerRecommendation = (mongoose.models.CareerRecommendation as mongoose.Model<ICareerRecommendation>) || mongoose.model<ICareerRecommendation>('CareerRecommendation', careerRecommendationSchema);
