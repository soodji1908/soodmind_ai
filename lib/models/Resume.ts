import mongoose, { Schema, type Types } from 'mongoose';

export type IResume = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileMimeType?: string;
  fileData?: Buffer;
  rawText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, maxlength: 255 },
    fileUrl: { type: String },
    fileType: { type: String, maxlength: 50 },
    fileMimeType: { type: String, maxlength: 150 },
    fileData: { type: Buffer, select: false },
    rawText: { type: String, required: true, maxlength: 200000 },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ deletedAt: 1 }, { sparse: true });

export const Resume = (mongoose.models.Resume as mongoose.Model<IResume>) || mongoose.model<IResume>('Resume', resumeSchema);
