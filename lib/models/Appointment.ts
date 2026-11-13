import mongoose, { Schema, type Types } from 'mongoose';

export type IAppointment = {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  userId?: Types.ObjectId;
  agentId?: Types.ObjectId;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const appointmentSchema = new Schema<IAppointment>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);

appointmentSchema.index({ propertyId: 1, scheduledAt: 1 });

export const Appointment = (mongoose.models.Appointment as mongoose.Model<IAppointment>) || mongoose.model<IAppointment>('Appointment', appointmentSchema);
