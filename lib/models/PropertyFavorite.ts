import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyFavorite = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  createdAt: Date;
};

const propertyFavoriteSchema = new Schema<IPropertyFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

propertyFavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const PropertyFavorite = (mongoose.models.PropertyFavorite as mongoose.Model<IPropertyFavorite>) || mongoose.model<IPropertyFavorite>('PropertyFavorite', propertyFavoriteSchema);
