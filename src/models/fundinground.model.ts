import { Schema, model, Document } from 'mongoose';

export interface FundingRoundDoc extends Document {
  company: Schema.Types.ObjectId;
  name?: string;
  date?: Date;
  preMoney?: number;
  amountRaised?: number;
  postMoney?: number;
}

const FundingRoundSchema = new Schema<FundingRoundDoc>({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: String,
  date: Date,
  preMoney: Number,
  amountRaised: Number,
  postMoney: Number
});

export const FundingRoundModel = model<FundingRoundDoc>('FundingRound', FundingRoundSchema);
