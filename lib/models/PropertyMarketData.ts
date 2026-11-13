import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyMarketData = {
  _id: Types.ObjectId;
  region: string;
  city: string;
  averagePrice: number;
  medianPrice: number;
  pricePerSqft: number;
  inventoryCount: number;
  daysOnMarket: number;
  trend: 'up' | 'down' | 'stable';
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const propertyMarketDataSchema = new Schema<IPropertyMarketData>(
  {
    region: { type: String, maxlength: 100 },
    city: { type: String, required: true, maxlength: 100 },
    averagePrice: { type: Number, default: 0 },
    medianPrice: { type: Number, default: 0 },
    pricePerSqft: { type: Number, default: 0 },
    inventoryCount: { type: Number, default: 0 },
    daysOnMarket: { type: Number, default: 0 },
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    recordedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

propertyMarketDataSchema.index({ city: 1, recordedAt: -1 });

export const PropertyMarketData = (mongoose.models.PropertyMarketData as mongoose.Model<IPropertyMarketData>) || mongoose.model<IPropertyMarketData>('PropertyMarketData', propertyMarketDataSchema);
