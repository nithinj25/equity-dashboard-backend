export interface CreateFundingRoundDTO {
  companyId: string;
  roundName: string;
  roundType: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo';
  date: Date;
  pricePerShare: number;
  totalInvestment: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  shareClassId?: string;
}

export interface UpdateFundingRoundDTO {
  roundName?: string;
  roundType?: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo';
  date?: Date;
  pricePerShare?: number;
  totalInvestment?: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  shareClassId?: string;
}

export interface FundingRoundResponseDTO {
  id: string;
  companyId: string;
  roundName: string;
  roundType: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo';
  date: Date;
  pricePerShare: number;
  totalInvestment: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  shareClassId?: string;
  sharesIssued?: number;
  dilution?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundingRoundWithInvestorsDTO extends FundingRoundResponseDTO {
  investors: {
    shareholderId: string;
    name: string;
    investmentAmount: number;
    sharesReceived: number;
    ownershipPercentage: number;
  }[];
}
