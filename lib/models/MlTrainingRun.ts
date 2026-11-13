import mongoose, { Schema, type Types } from 'mongoose';

export type IMlTrainingRun = {
  _id: Types.ObjectId;
  modelId: Types.ObjectId;
  version: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  parameters: Record<string, unknown>;
  metrics: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

const mlTrainingRunSchema = new Schema<IMlTrainingRun>(
  {
    modelId: { type: Schema.Types.ObjectId, ref: 'MlModel', required: true },
    version: { type: String, required: true, maxlength: 50 },
    status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date },
    parameters: { type: Schema.Types.Mixed, default: {} },
    metrics: { type: Schema.Types.Mixed, default: {} },
    error: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

mlTrainingRunSchema.index({ modelId: 1, createdAt: -1 });

export const MlTrainingRun = (mongoose.models.MlTrainingRun as mongoose.Model<IMlTrainingRun>) || mongoose.model<IMlTrainingRun>('MlTrainingRun', mlTrainingRunSchema);
