import { Schema, model, Document } from 'mongoose';

export interface CompanyDoc extends Document {
  name: string;
  currency: string;
  createdAt: Date;
}

const CompanySchema = new Schema<CompanyDoc>({
  name: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  createdAt: { type: Date, default: Date.now }
});

export const CompanyModel = model<CompanyDoc>('Company', CompanySchema);
