import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyDocument = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
};

const propertyDocumentSchema = new Schema<IPropertyDocument>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    fileName: { type: String, required: true, maxlength: 255 },
    fileUrl: { type: String, required: true },
    fileType: { type: String, maxlength: 50 },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true },
);

propertyDocumentSchema.index({ propertyId: 1 });

export const PropertyDocument = (mongoose.models.PropertyDocument as mongoose.Model<IPropertyDocument>) || mongoose.model<IPropertyDocument>('PropertyDocument', propertyDocumentSchema);
