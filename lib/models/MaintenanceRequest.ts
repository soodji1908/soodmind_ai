import mongoose, { Schema, type Types } from 'mongoose';

export type IMaintenanceRequest = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  tenantId?: Types.ObjectId;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
};

const maintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  },
  { timestamps: true },
);

maintenanceRequestSchema.index({ propertyId: 1, status: 1 });

export const MaintenanceRequest = (mongoose.models.MaintenanceRequest as mongoose.Model<IMaintenanceRequest>) || mongoose.model<IMaintenanceRequest>('MaintenanceRequest', maintenanceRequestSchema);
