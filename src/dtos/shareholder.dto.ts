export interface CreateShareholderDTO {
  name: string;
  email?: string;
  type: 'individual' | 'institutional' | 'founder' | 'employee';
  companyId: string;
}

export interface UpdateShareholderDTO {
  name?: string;
  email?: string;
  type?: 'individual' | 'institutional' | 'founder' | 'employee';
}

export interface ShareholderResponseDTO {
  id: string;
  name: string;
  email?: string;
  type: 'individual' | 'institutional' | 'founder' | 'employee';
  companyId: string;
  totalShares: number;
  ownershipPercentage: number;
  instruments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareholderWithEquityDTO extends ShareholderResponseDTO {
  equityDetails: {
    commonStock: number;
    preferredStock: number;
    options: number;
    warrants: number;
    totalEquityValue: number;
  };
}
