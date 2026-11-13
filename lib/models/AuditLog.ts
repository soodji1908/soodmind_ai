import mongoose, { Schema, type Types } from 'mongoose';

export type IAuditLog = {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, maxlength: 120 },
    entityType: { type: String },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1 });

export const AuditLog = (mongoose.models.AuditLog as mongoose.Model<IAuditLog>) || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
