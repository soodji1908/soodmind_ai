import mongoose, { Schema, type Types } from 'mongoose';

const PORTAL_ROLES: Record<string, string[]> = {
  estate: ['buyer', 'seller', 'owner', 'agent', 'investor'],
  career: ['student', 'job_seeker', 'recruiter', 'career_counselor'],
  admin: ['super_admin'],
  recruiter: ['recruiter', 'hiring_manager'],
};

export type PortalKey = 'estate' | 'career' | 'admin' | 'recruiter';

export type IPortalMembership = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  portal: string;
  role: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
};

const portalMembershipSchema = new Schema<IPortalMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    portal: { type: String, required: true, enum: Object.keys(PORTAL_ROLES) },
    role: {
      type: String,
      required: true,
      enum: Object.values(PORTAL_ROLES).flat(),
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true },
);

portalMembershipSchema.index({ userId: 1, portal: 1 }, { unique: true });
portalMembershipSchema.index({ portal: 1, status: 1 });

export { PORTAL_ROLES };
export const PortalMembership = (mongoose.models.PortalMembership as mongoose.Model<IPortalMembership>) || mongoose.model<IPortalMembership>('PortalMembership', portalMembershipSchema);
