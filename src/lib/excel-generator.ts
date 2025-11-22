 import * as XLSX from 'xlsx';
import { Property } from './types';

export interface TaxRecord {
  id?: string;
  propertyId: string;
  ownerName: string;
  fatherName: string;
  mobileNumber: string;
  address: string;
  propertyType: string;
  area: number;
  location: string;
  taxType: string;
  assessmentYear: string | number; // Can be number from Firestore or string for display
  baseAmount: number;
  status: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentDate?: string;
}

export interface ReportFilters {
  financialYear?: string;
  startDate?: Date;
  endDate?: Date;
  propertyType?: string;
  location?: string;
  paymentStatus?: string;
}

export const generateFinancialYearReport = (
  records: TaxRecord[],
  financialYear: string
) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for Excel
  const excelData = records.map((record, index) => ({
    'क्र.सं. (S.No.)': index + 1,
    'संपत्ति ID (Property ID)': record.propertyId,
    'मालिक का नाम (Owner Name)': record.ownerName,
    'पिता का नाम (Father Name)': record.fatherName,
    'मोबाइल नंबर (Mobile)': record.mobileNumber,
    'पता (Address)': record.address,
    'संपत्ति प्रकार (Property Type)': record.propertyType,
    'क्षेत्रफल (Area sq.ft)': record.area,
    'स्थान (Location)': record.location,
    'कर प्रकार (Tax Type)': record.taxType,
    'वित्तीय वर्ष (Financial Year)': typeof record.assessmentYear === 'number' ? record.assessmentYear.toString() : record.assessmentYear,
    'आधार राशि (Base Amount ₹)': record.baseAmount,
    'कुल राशि (Total Amount ₹)': record.totalAmount,
    'भुगतान राशि (Amount Paid ₹)': record.amountPaid,
    'शेष बकाया (Balance Due ₹)': record.balanceDue,
    'स्थिति (Status)': record.status,
    'भुगतान तिथि (Payment Date)': record.paymentDate || 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 8 },  // S.No
    { wch: 15 }, // Property ID
    { wch: 20 }, // Owner Name
    { wch: 20 }, // Father Name
    { wch: 12 }, // Mobile
    { wch: 30 }, // Address
    { wch: 15 }, // Property Type
    { wch: 12 }, // Area
    { wch: 12 }, // Location
    { wch: 15 }, // Tax Type
    { wch: 18 }, // Financial Year
    { wch: 15 }, // Base Amount
    { wch: 15 }, // Total Amount
    { wch: 15 }, // Amount Paid
    { wch: 15 }, // Balance Due
    { wch: 12 }, // Status
    { wch: 18 }  // Payment Date
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, `FY ${financialYear}`);

  // Create summary sheet
  const summary = createSummarySheet(records, financialYear);
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Generate file
  const fileName = `Tax_Report_FY_${financialYear}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};

export const generateCustomDateReport = (
  records: TaxRecord[],
  startDate: Date,
  endDate: Date
) => {
  const wb = XLSX.utils.book_new();

  const excelData = records.map((record, index) => ({
    'क्र.सं. (S.No.)': index + 1,
    'संपत्ति ID (Property ID)': record.propertyId,
    'मालिक का नाम (Owner Name)': record.ownerName,
    'पिता का नाम (Father Name)': record.fatherName,
    'मोबाइल नंबर (Mobile)': record.mobileNumber,
    'पता (Address)': record.address,
    'संपत्ति प्रकार (Property Type)': record.propertyType,
    'क्षेत्रफल (Area sq.ft)': record.area,
    'स्थान (Location)': record.location,
    'कर प्रकार (Tax Type)': record.taxType,
    'वित्तीय वर्ष (Financial Year)': record.assessmentYear,
    'आधार राशि (Base Amount ₹)': record.baseAmount,
    'कुल राशि (Total Amount ₹)': record.totalAmount,
    'भुग��ान राशि (Amount Paid ₹)': record.amountPaid,
    'शेष बकाया (Balance Due ₹)': record.balanceDue,
    'स्थिति (Status)': record.status,
    'भुगतान तिथि (Payment Date)': record.paymentDate || 'N/A'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);

  const colWidths = [
    { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
    { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 18 }
  ];
  ws['!cols'] = colWidths;

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  XLSX.utils.book_append_sheet(wb, ws, `${startStr} to ${endStr}`);

  // Add summary
  const summary = createSummarySheet(records, `${startStr} to ${endStr}`);
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const fileName = `Tax_Report_${startStr}_to_${endStr}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};

const createSummarySheet = (records: TaxRecord[], period: string) => {
  const totalProperties = new Set(records.map(r => r.propertyId)).size;
  const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalDue = records.reduce((sum, r) => sum + r.balanceDue, 0);

  const paidCount = records.filter(r => r.status === 'Paid').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const partialCount = records.filter(r => r.status === 'Partial').length;

  // Tax type wise summary
  const taxTypes = ['Property', 'Water', 'Sanitation', 'Lighting'];
  const taxSummary = taxTypes.map(type => {
    const typeRecords = records.filter(r => r.taxType === type);
    return {
      taxType: type,
      count: typeRecords.length,
      totalAmount: typeRecords.reduce((sum, r) => sum + r.totalAmount, 0),
      amountPaid: typeRecords.reduce((sum, r) => sum + r.amountPaid, 0),
      balanceDue: typeRecords.reduce((sum, r) => sum + r.balanceDue, 0)
    };
  });

  return [
    { 'विवरण (Description)': 'रिपोर्ट अवधि (Report Period)', 'मान (Value)': period },
    { 'विवरण (Description)': 'कुल संपत्तियां (Total Properties)', 'मान (Value)': totalProperties },
    { 'विवरण (Description)': 'कुल कर रिकॉर्ड (Total Tax Records)', 'मान (Value)': records.length },
    { 'विवरण (Description)': '', 'मान (Value)': '' },
    { 'विवरण (Description)': 'कुल राशि (Total Amount)', 'मान (Value)': `₹${totalAmount.toFixed(2)}` },
    { 'विवरण (Description)': 'भुगतान राशि (Amount Paid)', 'मान (Value)': `₹${totalPaid.toFixed(2)}` },
    { 'विवरण (Description)': 'शेष बकाया (Balance Due)', 'मान (Value)': `₹${totalDue.toFixed(2)}` },
    { 'विवरण (Description)': '', 'मान (Value)': '' },
    { 'विवरण (Description)': 'भुगतान स्थिति (Payment Status)', 'मान (Value)': '' },
    { 'विवरण (Description)': '  पूर्ण भुगतान (Fully Paid)', 'मान (Value)': paidCount },
    { 'विवरण (Description)': '  आंशिक भुगतान (Partial)', 'मान (Value)': partialCount },
    { 'विवरण (Description)': '  लंबित (Pending)', 'मान (Value)': pendingCount },
    { 'विवरण (Description)': '', 'मान (Value)': '' },
    { 'विवरण (Description)': 'कर प्रकार सारांश (Tax Type Summary)', 'मान (Value)': '' },
    ...taxSummary.map(ts => ({
      'विवरण (Description)': `  ${ts.taxType} कर (${ts.taxType} Tax)`,
      'मान (Value)': `${ts.count} रिकॉर्ड, ₹${ts.totalAmount.toFixed(2)} कुल, ₹${ts.balanceDue.toFixed(2)} बकाया`
    }))
  ];
};

export const generateAllTaxesBill = (
  property: Property,
  allTaxes: any[],
  panchayatInfo: any
) => {
  const wb = XLSX.utils.book_new();

  // Prepare consolidated tax data
  const taxData = allTaxes.map((tax, index) => ({
    'क्र.सं. (S.No.)': index + 1,
    'कर प्रकार (Tax Type)': tax.taxType,
    'वित्तीय वर्ष (Financial Year)': typeof tax.assessmentYear === 'number' ? tax.assessmentYear.toString() : tax.assessmentYear,
    'आधार राशि (Base Amount ₹)': tax.baseAmount,
    'स्थिति (Status)': tax.status,
    'कुल राशि (Total Amount ₹)': tax.totalAmount,
    'भुगतान राशि (Amount Paid ₹)': tax.amountPaid,
    'शेष बकाया (Balance Due ₹)': tax.balanceDue
  }));

  const ws = XLSX.utils.json_to_sheet([
    { 'A': `${panchayatInfo.name || 'लोनी पंचायत'}` },
    { 'A': `संपत्ति ID: ${property.id}` },
    { 'A': `मालिक: ${property.ownerName}` },
    { 'A': `पिता का नाम: ${property.fatherName}` },
    { 'A': `मोबाइल: ${property.mobileNumber}` },
    { 'A': '' },
    ...taxData
  ], { skipHeader: true });

  XLSX.utils.book_append_sheet(wb, ws, 'All Taxes');

  const fileName = `All_Taxes_${property.id}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};
