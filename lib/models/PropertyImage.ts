import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyImage = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  url: string;
  caption?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const propertyImageSchema = new Schema<IPropertyImage>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    url: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

propertyImageSchema.index({ propertyId: 1, order: 1 });

export const PropertyImage = (mongoose.models.PropertyImage as mongoose.Model<IPropertyImage>) || mongoose.model<IPropertyImage>('PropertyImage', propertyImageSchema);
