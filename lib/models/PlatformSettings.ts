import mongoose, { Schema, type Types } from 'mongoose';

export type IPlatformSettings = {
  _id: Types.ObjectId;
  key: string;
  value: unknown;
  description?: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
};

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: { type: String, required: true, unique: true, maxlength: 100 },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

platformSettingsSchema.index({ key: 1 }, { unique: true });

export const PlatformSettings = (mongoose.models.PlatformSettings as mongoose.Model<IPlatformSettings>) || mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
