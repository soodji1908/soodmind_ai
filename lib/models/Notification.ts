import mongoose, { Schema, type Types } from 'mongoose';

export type INotification = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  portal?: string;
  title: string;
  body: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    portal: { type: String, enum: ['estate', 'career', 'admin', 'recruiter', null] },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, default: '', maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = (mongoose.models.Notification as mongoose.Model<INotification>) || mongoose.model<INotification>('Notification', notificationSchema);
