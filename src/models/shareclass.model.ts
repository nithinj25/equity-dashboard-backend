import { Schema, model, Document } from 'mongoose';

export interface ShareClassDoc extends Document {
  company: Schema.Types.ObjectId;
  name: string;
  classType: 'COMMON' | 'PREFERRED' | 'OPTION';
  parValue: number;
  liquidationPrefMultiplier: number;
}

const ShareClassSchema = new Schema<ShareClassDoc>({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  classType: { type: String, enum: ['COMMON', 'PREFERRED', 'OPTION'], default: 'COMMON' },
  parValue: { type: Number, default: 0 },
  liquidationPrefMultiplier: { type: Number, default: 1 }
});

export const ShareClassModel = model<ShareClassDoc>('ShareClass', ShareClassSchema);
