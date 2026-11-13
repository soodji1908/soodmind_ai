import mongoose, { Schema, type Types } from 'mongoose';

export type IMlModelVersion = {
  _id: Types.ObjectId;
  modelId: Types.ObjectId;
  version: string;
  filePath?: string;
  metrics: Record<string, unknown>;
  isProduction: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const mlModelVersionSchema = new Schema<IMlModelVersion>(
  {
    modelId: { type: Schema.Types.ObjectId, ref: 'MlModel', required: true },
    version: { type: String, required: true, maxlength: 50 },
    filePath: { type: String },
    metrics: { type: Schema.Types.Mixed, default: {} },
    isProduction: { type: Boolean, default: false },
  },
  { timestamps: true },
);

mlModelVersionSchema.index({ modelId: 1, version: 1 }, { unique: true });

export const MlModelVersion = (mongoose.models.MlModelVersion as mongoose.Model<IMlModelVersion>) || mongoose.model<IMlModelVersion>('MlModelVersion', mlModelVersionSchema);
