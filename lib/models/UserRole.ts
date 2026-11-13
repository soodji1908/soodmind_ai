import mongoose, { Schema, type Types } from 'mongoose';

export type IUserRole = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'super_admin';
  grantedBy?: Types.ObjectId;
  grantedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const userRoleSchema = new Schema<IUserRole>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, enum: ['super_admin'] },
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    grantedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

userRoleSchema.index({ userId: 1, role: 1 }, { unique: true });

export const UserRole = (mongoose.models.UserRole as mongoose.Model<IUserRole>) || mongoose.model<IUserRole>('UserRole', userRoleSchema);
