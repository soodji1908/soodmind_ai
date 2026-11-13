import mongoose, { Schema, type Types } from 'mongoose';

export type IMlDataset = {
  _id: Types.ObjectId;
  name: string;
  type: string;
  filePath?: string;
  rowCount: number;
  features: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

const mlDatasetSchema = new Schema<IMlDataset>(
  {
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 50 },
    filePath: { type: String },
    rowCount: { type: Number, default: 0 },
    features: [String],
    description: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

mlDatasetSchema.index({ type: 1 });

export const MlDataset = (mongoose.models.MlDataset as mongoose.Model<IMlDataset>) || mongoose.model<IMlDataset>('MlDataset', mlDatasetSchema);
