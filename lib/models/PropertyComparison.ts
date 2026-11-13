import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyComparison = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  propertyIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

const propertyComparisonSchema = new Schema<IPropertyComparison>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    propertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true },
);

propertyComparisonSchema.index({ userId: 1 });

export const PropertyComparison = (mongoose.models.PropertyComparison as mongoose.Model<IPropertyComparison>) || mongoose.model<IPropertyComparison>('PropertyComparison', propertyComparisonSchema);
