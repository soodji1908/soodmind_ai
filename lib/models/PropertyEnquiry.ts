import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyEnquiry = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  userId?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'responded' | 'closed';
  createdAt: Date;
  updatedAt: Date;
};

const propertyEnquirySchema = new Schema<IPropertyEnquiry>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, maxlength: 30 },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'responded', 'closed'], default: 'new' },
  },
  { timestamps: true },
);

propertyEnquirySchema.index({ propertyId: 1, createdAt: -1 });

export const PropertyEnquiry = (mongoose.models.PropertyEnquiry as mongoose.Model<IPropertyEnquiry>) || mongoose.model<IPropertyEnquiry>('PropertyEnquiry', propertyEnquirySchema);
