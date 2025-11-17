
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Property, TaxRecord, PanchayatSettings } from './types';

/**
 * Extend jsPDF with the autoTable method from jspdf-autotable plugin
 */
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable?: { finalY: number };
}

/**
 * Format currency in Indian numbering system
 * @param amount - Amount to format
 * @returns Formatted currency string with ₹ symbol
 */
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generate a PDF bill for property taxes
 * @param property - Property details
 * @param taxes - Array of tax records to include in the bill
 * @param settings - Panchayat settings for header information
 */
export const generateBillPdf = async (
  property: Property,
  taxes: TaxRecord[],
  settings: PanchayatSettings
): Promise<void> => {
  try {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Government Header with Border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(margin, 10, contentWidth, 35);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.panchayatName.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`District: ${settings.district}, ${settings.state} - ${settings.pinCode}`, pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY TAX DEMAND NOTICE', pageWidth / 2, 38, { align: 'center' });

    // Bill Number and Date Box
    let yPos = 52;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const receiptNo = taxes[0]?.receiptNumber || `RCT${Date.now().toString().slice(-8)}`;
    const billDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const assessmentYear = taxes[0]?.assessmentYear || new Date().getFullYear();
    
    doc.text('Receipt No:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptNo, margin + 30, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', pageWidth - margin - 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(billDate, pageWidth - margin - 20, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Year:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(assessmentYear.toString(), margin + 40, yPos);

    // Property Owner Details Box
    yPos += 10;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, contentWidth, 30);
    
    yPos += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY OWNER DETAILS:', margin + 3, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${property.ownerName}`, margin + 3, yPos);
    doc.text(`Father's Name: ${property.fatherName}`, margin + 3, yPos + 6);
    doc.text(`Property ID: ${property.propertyId || property.id}`, margin + 3, yPos + 12);
    
    doc.text(`House No: ${property.houseNo}`, pageWidth - margin - 70, yPos);
    doc.text(`Mobile: ${property.mobileNumber}`, pageWidth - margin - 70, yPos + 6);
    doc.text(`Type: ${property.propertyType}`, pageWidth - margin - 70, yPos + 12);

    yPos += 20;
    doc.setFontSize(9);
    doc.text(`Address: ${property.address}`, margin + 3, yPos);

    // Tax Details Table
    yPos += 8;
    const tableData = taxes.map(tax => {
      const taxDetails = tax.taxDetails || [];
      const baseAmount = tax.baseAmount || tax.assessedAmount;
      
      return [
        tax.taxType,
        tax.hindiName,
        assessmentYear.toString(),
        formatCurrency(baseAmount),
        tax.paymentStatus,
        formatCurrency(tax.assessedAmount)
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Tax Type', 'कर प्रकार', 'Year', 'Base Amount', 'Status', 'Total Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    // Payment Summary Box
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const boxHeight = 45;
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - margin - 70, finalY, 70, boxHeight, 'FD');
    
    let summaryY = finalY + 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', pageWidth - margin - 65, summaryY);
    
    const totalAssessed = taxes.reduce((sum, tax) => sum + tax.assessedAmount, 0);
    const totalPaid = taxes.reduce((sum, tax) => sum + tax.amountPaid, 0);
    const totalDue = totalAssessed - totalPaid;
    
    summaryY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Total Assessed:', pageWidth - margin - 68, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalAssessed), pageWidth - margin - 3, summaryY, { align: 'right' });
    
    summaryY += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Amount Paid:', pageWidth - margin - 68, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text(formatCurrency(totalPaid), pageWidth - margin - 3, summaryY, { align: 'right' });
    
    summaryY += 6;
    doc.setTextColor(0);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 68, summaryY, pageWidth - margin - 3, summaryY);
    
    summaryY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Amount Due:', pageWidth - margin - 68, summaryY);
    if (totalDue > 0) {
      doc.setTextColor(220, 53, 69);
    } else {
      doc.setTextColor(0, 128, 0);
    }
    doc.text(formatCurrency(totalDue), pageWidth - margin - 3, summaryY, { align: 'right' });
    doc.setTextColor(0);

    // Payment Instructions
    const instructY = finalY + boxHeight + 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INSTRUCTIONS:', margin, instructY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const instructions = [
      '1. Payment can be made at Panchayat Office or through authorized collection centers',
      '2. Collect official receipt after payment',
      `3. Late payment will attract ${settings.lateFee}% penalty per month`,
      '4. For queries, contact Panchayat Office during working hours (10 AM - 5 PM)'
    ];
    
    let instY = instructY + 7;
    instructions.forEach(inst => {
      doc.text(inst, margin + 3, instY);
      instY += 5;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, footerY + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${settings.panchayatName} | ${settings.district}, ${settings.state}`, pageWidth / 2, footerY + 15, { align: 'center' });

    // Save PDF
    const filename = `Tax-Receipt-${property.propertyId || property.id}-${billDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  
  } catch (error) {
    const { logger } = await import('./logger');
    logger.error('Failed to generate PDF bill', error as Error, {
      propertyId: property.id,
      taxCount: taxes.length,
    });
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
