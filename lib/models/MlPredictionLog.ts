import mongoose, { Schema, type Types } from 'mongoose';

export type IMlPredictionLog = {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  modelType: string;
  modelVersion?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latencyMs?: number;
  createdAt: Date;
};

const mlPredictionLogSchema = new Schema<IMlPredictionLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    modelType: { type: String, required: true, maxlength: 50 },
    modelVersion: { type: String, maxlength: 50 },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    latencyMs: { type: Number, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

mlPredictionLogSchema.index({ modelType: 1, createdAt: -1 });
mlPredictionLogSchema.index({ userId: 1, createdAt: -1 });

export const MlPredictionLog = (mongoose.models.MlPredictionLog as mongoose.Model<IMlPredictionLog>) || mongoose.model<IMlPredictionLog>('MlPredictionLog', mlPredictionLogSchema);
