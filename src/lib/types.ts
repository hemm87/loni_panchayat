export type TaxRecord = {
  id: string;
  taxType: 'Property Tax' | 'Business Tax' | 'Land Tax' | 'Water Tax' | 'Lighting Tax' | 'Other';
  hindiName: string;
  assessedAmount: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  amountPaid: number;
  paymentDate?: string;
  receiptNumber?: string;
  assessmentYear: number;
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
