import mongoose, { Schema, type Types } from 'mongoose';

export type IInterviewSession = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  questions: string[];
  responses: Array<{ question: string; response: string; score?: number }>;
  overallScore?: number;
  feedback?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
};

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, maxlength: 100 },
    questions: [String],
    responses: [{
      question: String,
      response: String,
      score: Number,
    }],
    overallScore: { type: Number, min: 0, max: 100 },
    feedback: { type: String, maxlength: 5000 },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
  },
  { timestamps: true },
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export const InterviewSession = (mongoose.models.InterviewSession as mongoose.Model<IInterviewSession>) || mongoose.model<IInterviewSession>('InterviewSession', interviewSessionSchema);
