import { Schema, model, Document } from 'mongoose';

export interface ShareholderDoc extends Document {
  company: Schema.Types.ObjectId;
  name: string;
  email?: string;
}

const ShareholderSchema = new Schema<ShareholderDoc>({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  email: { type: String }
});

export const ShareholderModel = model<ShareholderDoc>('Shareholder', ShareholderSchema);
