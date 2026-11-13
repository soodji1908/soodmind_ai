import mongoose, { Schema, type Types } from 'mongoose';

export type IAgentCommission = {
  _id: Types.ObjectId;
  agentId: Types.ObjectId;
  propertyId?: Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
};

const agentCommissionSchema = new Schema<IAgentCommission>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'disputed'], default: 'pending' },
  },
  { timestamps: true },
);

agentCommissionSchema.index({ agentId: 1, status: 1 });

export const AgentCommission = (mongoose.models.AgentCommission as mongoose.Model<IAgentCommission>) || mongoose.model<IAgentCommission>('AgentCommission', agentCommissionSchema);
