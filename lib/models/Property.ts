import mongoose, { Schema, type Types } from 'mongoose';

export type IProperty = {
  _id: Types.ObjectId;
  tenantId?: Types.ObjectId;
  ownerUserId?: Types.ObjectId;
  title: string;
  description: string;
  propertyType: string;
  status: 'for_sale' | 'for_rent' | 'sold' | 'off_market';
  price: number;
  currency: string;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt?: number;
  garageSpaces?: number;
  lotSizeSqft?: number;
  location: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  amenities: string[];
  images: Types.ObjectId[];
  documents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

const propertySchema = new Schema<IProperty>(
  {
    tenantId: { type: Schema.Types.ObjectId },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    propertyType: { type: String, required: true, maxlength: 50 },
    status: { type: String, enum: ['for_sale', 'for_rent', 'sold', 'off_market'], default: 'for_sale' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
    areaSqft: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    yearBuilt: { type: Number, min: 1800 },
    garageSpaces: { type: Number, min: 0 },
    lotSizeSqft: { type: Number, min: 0 },
    location: {
      address: { type: String, required: true, maxlength: 300 },
      city: { type: String, required: true, maxlength: 100 },
      state: { type: String, maxlength: 100 },
      zipCode: { type: String, maxlength: 20 },
      country: { type: String, default: 'US', maxlength: 2 },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    amenities: [{ type: String, maxlength: 100 }],
    images: [{ type: Schema.Types.ObjectId, ref: 'PropertyImage' }],
    documents: [{ type: Schema.Types.ObjectId, ref: 'PropertyDocument' }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

propertySchema.index({ tenantId: 1, status: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ deletedAt: 1 }, { sparse: true });

export const Property = (mongoose.models.Property as mongoose.Model<IProperty>) || mongoose.model<IProperty>('Property', propertySchema);
