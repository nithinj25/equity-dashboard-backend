import { Schema, model, Document } from 'mongoose';

export interface InstrumentDoc extends Document {
  company: Schema.Types.ObjectId;
  shareholder: Schema.Types.ObjectId;
  shareClass: Schema.Types.ObjectId;
  shares: number;
  grantDate?: Date;
  pricePerShare?: number;
}

const InstrumentSchema = new Schema<InstrumentDoc>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    shareholder: { type: Schema.Types.ObjectId, ref: 'Shareholder', required: true },
    shareClass: { type: Schema.Types.ObjectId, ref: 'ShareClass', required: true },
    shares: { type: Number, required: true },
    grantDate: Date,
    pricePerShare: Number
  },
  { timestamps: true }
);

export const InstrumentModel = model<InstrumentDoc>('Instrument', InstrumentSchema);
