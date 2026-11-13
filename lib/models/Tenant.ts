import mongoose, { Schema, type Types } from 'mongoose';

export type ITenant = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  leaseStart: Date;
  leaseEnd: Date;
  rentAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

const tenantSchema = new Schema<ITenant>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, maxlength: 255 },
    phone: { type: String, maxlength: 30 },
    leaseStart: { type: Date },
    leaseEnd: { type: Date },
    rentAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

tenantSchema.index({ propertyId: 1 });

export const Tenant = (mongoose.models.Tenant as mongoose.Model<ITenant>) || mongoose.model<ITenant>('Tenant', tenantSchema);
