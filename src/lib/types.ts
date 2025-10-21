
export type TaxRecord = {
  id: string;
  taxType: 'Property Tax' | 'Water Tax' | 'Sanitation Tax' | 'Lighting Tax' | 'Land Tax' | 'Business Tax' | 'Other';
  hindiName: string;
  assessedAmount: number; // This will now be the Grand Total
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  amountPaid: number;
  paymentDate: string | null;
  receiptNumber: string | null;
  assessmentYear: number;
  remarks?: string;
  baseAmount?: number; // The amount before manual taxes
  taxDetails?: Array<{ name: string; rate: number; amount: number; }>; // Details of manual taxes
};

export type Property = {
  id: string;
  ownerName: string;
  fatherName: string;
  mobileNumber: string;
  houseNo: string;
  address: string;
  aadhaarHash: string; // Storing a hash, not the real number
  propertyType: 'Residential' | 'Commercial' | 'Agricultural';
  area: number; // in sq.ft
  photoUrl: string;
  photoHint: string;
  documents?: string[];
  taxes: TaxRecord[];
};

export type Payment = {
  id: string;
  ownerName: string;
  propertyId: string;
  amount: number;
  date: string;
  taxType: string;
};

export type PanchayatSettings = {
    panchayatName: string;
    district: string;
    state: string;
    pinCode: string;
    propertyTaxRate: number;
    waterTaxRate: number;
    lateFee: number;
};
