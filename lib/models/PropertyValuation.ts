import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyValuation = {
  _id: Types.ObjectId;
  propertyId?: Types.ObjectId;
  userId: Types.ObjectId;
  estimatedPrice: number;
  rangeLow: number;
  rangeHigh: number;
  modelLabel: string;
  factors: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const propertyValuationSchema = new Schema<IPropertyValuation>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedPrice: { type: Number, required: true },
    rangeLow: { type: Number, required: true },
    rangeHigh: { type: Number, required: true },
    modelLabel: { type: String, required: true },
    factors: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

propertyValuationSchema.index({ userId: 1, createdAt: -1 });
propertyValuationSchema.index({ propertyId: 1 });

export const PropertyValuation = (mongoose.models.PropertyValuation as mongoose.Model<IPropertyValuation>) || mongoose.model<IPropertyValuation>('PropertyValuation', propertyValuationSchema);
