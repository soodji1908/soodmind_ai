import mongoose, { Schema, type Types } from 'mongoose';

export type IOrganization = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
};

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 100 },
    industry: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 300 },
  },
  { timestamps: true },
);

organizationSchema.index({ slug: 1 }, { unique: true });

export const Organization = (mongoose.models.Organization as mongoose.Model<IOrganization>) || mongoose.model<IOrganization>('Organization', organizationSchema);
