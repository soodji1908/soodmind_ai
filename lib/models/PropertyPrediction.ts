import mongoose, { Schema, type Types } from 'mongoose';

export type IPropertyPrediction = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  input: Record<string, unknown>;
  prediction: Record<string, unknown>;
  modelVersion?: string;
  createdAt: Date;
  updatedAt: Date;
};

const propertyPredictionSchema = new Schema<IPropertyPrediction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    input: { type: Schema.Types.Mixed, required: true },
    prediction: { type: Schema.Types.Mixed, required: true },
    modelVersion: { type: String },
  },
  { timestamps: true },
);

propertyPredictionSchema.index({ userId: 1, createdAt: -1 });

export const PropertyPrediction = (mongoose.models.PropertyPrediction as mongoose.Model<IPropertyPrediction>) || mongoose.model<IPropertyPrediction>('PropertyPrediction', propertyPredictionSchema);
