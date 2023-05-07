export type Investor = {
  id: string;
  name: string;
  email: string;
  code: number;
  phone: string;
  address: string;
  bank: {
    bankName: string;
    accountNumber: string;
  }[];
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  updatedBy: string;
};

export type Agent = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  investorId: string;
};

export type Investment = {
  id: string;
  type: 'BONDS' | 'CERTIFICATES';
  amount: number;
  interestRate: number;
  createdAt: Date;
  redemptionDate: Date;
  redeemed: boolean;
  bank: Prisma.JsonValue;
  valueOnMaturity: number;
  customId: string | null;
  updatedAt: Date;
  deletedAt: Date | null;
  investorId: string;
  createdById: string;
  ROI?: string;
};

