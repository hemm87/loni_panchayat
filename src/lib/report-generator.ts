// Report generation utilities
import type { Property, TaxRecord, PanchayatSettings } from './types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export interface PendingBillRecord {
  propertyId: string;
  ownerName: string;
  mobileNumber: string;
  address: string;
  propertyType: string;
  houseNo: string;
  taxes: {
    taxType: string;
    assessedAmount: number;
    amountPaid: number;
    dueAmount: number;
    assessmentYear: number;
    receiptNumber: string | null;
  }[];
  totalDue: number;
}

export interface ReportFilters {
  fromDate: string;
  toDate: string;
  reportType: 'all' | 'pending' | 'paid' | 'revenue';
  propertyType?: string;
}

export interface ReportSummary {
  totalProperties: number;
  propertiesWithDues: number;
  totalAssessed: number;
  totalPaid: number;
  totalDue: number;
  generatedDate: string;
}

/**
 * Calculate pending bills from all properties
 */
export function calculatePendingBills(properties: Property[]): PendingBillRecord[] {
  const pendingRecords: PendingBillRecord[] = [];

  properties.forEach(property => {
    if (!property.taxes || property.taxes.length === 0) return;

    const pendingTaxes = property.taxes.filter(tax => {
      const dueAmount = tax.assessedAmount - tax.amountPaid;
      return dueAmount > 0;
    });

    if (pendingTaxes.length > 0) {
      const totalDue = pendingTaxes.reduce((sum, tax) => 
        sum + (tax.assessedAmount - tax.amountPaid), 0
      );

      pendingRecords.push({
        propertyId: property.id,
        ownerName: property.ownerName,
        mobileNumber: property.mobileNumber,
        address: property.address,
        propertyType: property.propertyType,
        houseNo: property.houseNo,
        taxes: pendingTaxes.map(tax => ({
          taxType: tax.taxType,
          assessedAmount: tax.assessedAmount,
          amountPaid: tax.amountPaid,
          dueAmount: tax.assessedAmount - tax.amountPaid,
          assessmentYear: tax.assessmentYear,
          receiptNumber: tax.receiptNumber,
        })),
        totalDue,
      });
    }
  });

  // Sort by total due amount (highest first)
  return pendingRecords.sort((a, b) => b.totalDue - a.totalDue);
}

/**
 * Filter properties by date range
 */
export function filterPropertiesByDateRange(
  properties: Property[],
  fromDate: string,
  toDate: string
): Property[] {
  if (!fromDate && !toDate) return properties;

  const from = fromDate ? new Date(fromDate).getTime() : 0;
  const to = toDate ? new Date(toDate).getTime() : Date.now();

  return properties.filter(property => {
    if (!property.taxes || property.taxes.length === 0) return false;

    return property.taxes.some(tax => {
      const assessmentDate = new Date(tax.assessmentYear, 0, 1).getTime();
      return assessmentDate >= from && assessmentDate <= to;
    });
  });
}

/**
 * Generate report summary statistics
 */
export function generateReportSummary(
  properties: Property[],
  pendingBills: PendingBillRecord[]
): ReportSummary {
  let totalAssessed = 0;
  let totalPaid = 0;

  properties.forEach(property => {
    property.taxes?.forEach(tax => {
      totalAssessed += tax.assessedAmount;
      totalPaid += tax.amountPaid;
    });
  });

  return {
    totalProperties: properties.length,
    propertiesWithDues: pendingBills.length,
    totalAssessed,
    totalPaid,
    totalDue: totalAssessed - totalPaid,
    generatedDate: new Date().toISOString(),
  };
}

/**
 * Export pending bills report to PDF
 */
export function exportPendingBillsReport(
  pendingBills: PendingBillRecord[],
  summary: ReportSummary,
  settings: PanchayatSettings
) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.panchayatName, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const address = `${settings.district}, ${settings.state} - ${settings.pinCode}`;
  doc.text(address, pageWidth / 2, 28, { align: 'center' });
  doc.text('Pending Bills Report • बकाया बिल रिपोर्ट', pageWidth / 2, 36, { align: 'center' });

  // Report date
  const reportDate = new Date(summary.generatedDate).toLocaleDateString('en-IN');
  doc.setFontSize(9);
  doc.text(`Generated on: ${reportDate}`, pageWidth / 2, 42, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 46, pageWidth - 15, 46);

  // Summary section
  let yPos = 54;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary • सारांश', 15, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Properties: ${summary.totalProperties}`, 15, yPos);
  doc.text(`Properties with Dues: ${summary.propertiesWithDues}`, 105, yPos);

  yPos += 6;
  doc.text(`Total Assessed: ₹${summary.totalAssessed.toLocaleString('en-IN')}`, 15, yPos);
  doc.text(`Total Paid: ₹${summary.totalPaid.toLocaleString('en-IN')}`, 105, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Outstanding: ₹${summary.totalDue.toLocaleString('en-IN')}`, 15, yPos);

  yPos += 10;

  // Pending bills table
  const tableData = pendingBills.map((record, index) => {
    const taxDetails = record.taxes.map(t => 
      `${t.taxType} (${t.assessmentYear})`
    ).join(', ');

    return [
      (index + 1).toString(),
      record.propertyId,
      record.ownerName,
      record.mobileNumber,
      taxDetails,
      `₹${record.totalDue.toLocaleString('en-IN')}`,
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Property ID', 'Owner Name', 'Mobile', 'Pending Taxes', 'Amount Due']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [239, 68, 68], // Red
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 28 },
      2: { cellWidth: 40 },
      3: { cellWidth: 28 },
      4: { cellWidth: 50 },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (data: any) => {
      // Footer
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Save
  const filename = `Pending-Bills-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export revenue report to PDF
 */
export function exportRevenueReport(
  properties: Property[],
  summary: ReportSummary,
  settings: PanchayatSettings
) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.panchayatName, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const address = `${settings.district}, ${settings.state} - ${settings.pinCode}`;
  doc.text(address, pageWidth / 2, 28, { align: 'center' });
  doc.text('Revenue Report • राजस्व रिपोर्ट', pageWidth / 2, 36, { align: 'center' });

  const reportDate = new Date(summary.generatedDate).toLocaleDateString('en-IN');
  doc.setFontSize(9);
  doc.text(`Generated on: ${reportDate}`, pageWidth / 2, 42, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 46, pageWidth - 15, 46);

  // Summary
  let yPos = 54;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue Summary • राजस्व सारांश', 15, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Properties: ${summary.totalProperties}`, 15, yPos);
  yPos += 6;
  doc.text(`Total Assessed: ₹${summary.totalAssessed.toLocaleString('en-IN')}`, 15, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(34, 197, 94);
  doc.rect(14, yPos - 4, 3, 5, 'F');
  doc.text(`Total Revenue Collected: ₹${summary.totalPaid.toLocaleString('en-IN')}`, 20, yPos);
  yPos += 6;
  doc.setFillColor(239, 68, 68);
  doc.rect(14, yPos - 4, 3, 5, 'F');
  doc.text(`Outstanding Amount: ₹${summary.totalDue.toLocaleString('en-IN')}`, 20, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const collectionRate = summary.totalAssessed > 0 
    ? ((summary.totalPaid / summary.totalAssessed) * 100).toFixed(2) 
    : '0.00';
  doc.text(`Collection Rate: ${collectionRate}%`, 15, yPos);

  yPos += 10;

  // Property-wise revenue
  const tableData = properties.map((property, index) => {
    const assessed = property.taxes?.reduce((sum, t) => sum + t.assessedAmount, 0) || 0;
    const paid = property.taxes?.reduce((sum, t) => sum + t.amountPaid, 0) || 0;
    const due = assessed - paid;

    return [
      (index + 1).toString(),
      property.id,
      property.ownerName,
      property.propertyType,
      `₹${assessed.toLocaleString('en-IN')}`,
      `₹${paid.toLocaleString('en-IN')}`,
      `₹${due.toLocaleString('en-IN')}`,
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Property ID', 'Owner', 'Type', 'Assessed', 'Paid', 'Due']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94], // Green
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 28 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right', textColor: [34, 197, 94] },
      6: { cellWidth: 25, halign: 'right', textColor: [239, 68, 68] },
    },
    didDrawPage: (data: any) => {
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  const filename = `Revenue-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
