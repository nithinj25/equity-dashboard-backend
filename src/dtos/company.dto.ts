export interface CreateCompanyDTO {
  name: string;
  foundedDate?: Date;
  description?: string;
  industry?: string;
  website?: string;
  currency?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  foundedDate?: Date;
  description?: string;
  industry?: string;
  website?: string;
  currency?: string;
}

export interface CompanyResponseDTO {
  id: string;
  name: string;
  foundedDate?: Date;
  description?: string;
  industry?: string;
  website?: string;
  currency?: string;
  totalShares?: number;
  totalShareholders?: number;
  totalFundingRounds?: number;
  currentValuation?: number;
  createdAt: Date;
  updatedAt: Date;
}
