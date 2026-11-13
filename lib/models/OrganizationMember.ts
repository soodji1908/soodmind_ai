import mongoose, { Schema, type Types } from 'mongoose';

export type IOrganizationMember = {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
};

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  },
  { timestamps: true },
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const OrganizationMember = (mongoose.models.OrganizationMember as mongoose.Model<IOrganizationMember>) || mongoose.model<IOrganizationMember>('OrganizationMember', organizationMemberSchema);
