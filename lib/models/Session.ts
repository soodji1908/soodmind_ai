import mongoose, { Schema, type Types } from 'mongoose';

export type ISession = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  portal: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    portal: { type: String, required: true },
    userAgent: { type: String, maxlength: 300 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1, expiresAt: -1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = (mongoose.models.Session as mongoose.Model<ISession>) || mongoose.model<ISession>('Session', sessionSchema);
