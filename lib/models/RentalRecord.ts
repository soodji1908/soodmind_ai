import mongoose, { Schema, type Types } from 'mongoose';

export type IRentalRecord = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  tenantId?: Types.ObjectId;
  monthlyRent: number;
  leaseStart: Date;
  leaseEnd: Date;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
};

const rentalRecordSchema = new Schema<IRentalRecord>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    monthlyRent: { type: Number, required: true, min: 0 },
    leaseStart: { type: Date, required: true },
    leaseEnd: { type: Date, required: true },
    deposit: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'expired', 'terminated'], default: 'active' },
  },
  { timestamps: true },
);

rentalRecordSchema.index({ propertyId: 1 });

export const RentalRecord = (mongoose.models.RentalRecord as mongoose.Model<IRentalRecord>) || mongoose.model<IRentalRecord>('RentalRecord', rentalRecordSchema);
