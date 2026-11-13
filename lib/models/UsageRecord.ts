import mongoose, { Schema, type Types } from 'mongoose';

export type IUsageRecord = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  feature: string;
  count: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
};

const usageRecordSchema = new Schema<IUsageRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feature: { type: String, required: true, maxlength: 50 },
    count: { type: Number, default: 0, min: 0 },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
  },
  { timestamps: true },
);

usageRecordSchema.index({ userId: 1, feature: 1, periodStart: -1 });

export const UsageRecord = (mongoose.models.UsageRecord as mongoose.Model<IUsageRecord>) || mongoose.model<IUsageRecord>('UsageRecord', usageRecordSchema);
