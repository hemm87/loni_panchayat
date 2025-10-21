
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Property, TaxRecord, PanchayatSettings } from './types';

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateBillPdf = async (
  property: Property,
  taxes: TaxRecord[],
  settings: PanchayatSettings
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.panchayatName, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const address = `${settings.district}, ${settings.state} - ${settings.pinCode}`;
  doc.text(address, pageWidth / 2, 28, { align: 'center' });
  doc.text('Property Tax Bill / संपत्ति कर बिल', pageWidth / 2, 36, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);

  // 2. Bill Information
  const billInfoY = 48;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 15, billInfoY);
  doc.setFont('helvetica', 'normal');
  doc.text(property.ownerName, 15, billInfoY + 6);
  doc.text(property.address, 15, billInfoY + 12);
  doc.text(`Mobile: ${property.mobileNumber}`, 15, billInfoY + 18);

  const billNo = `BILL-${Date.now()}`;
  const billDate = new Date().toLocaleDateString('en-IN');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Bill No.:', pageWidth - 60, billInfoY);
  doc.setFont('helvetica', 'normal');
  doc.text(billNo, pageWidth - 15, billInfoY, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Bill Date:', pageWidth - 60, billInfoY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(billDate, pageWidth - 15, billInfoY + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Property ID:', pageWidth - 60, billInfoY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(property.id, pageWidth - 15, billInfoY + 12, { align: 'right' });

  // 3. Itemized Tax Table
  const tableData = taxes.map(tax => {
    const due = tax.assessedAmount - tax.amountPaid;
    return [
      `${tax.taxType} (${tax.assessmentYear})`,
      tax.hindiName,
      `₹${tax.assessedAmount.toLocaleString('en-IN')}`,
      `₹${tax.amountPaid.toLocaleString('en-IN')}`,
      `₹${due.toLocaleString('en-IN')}`,
    ];
  });

  const totalAssessed = taxes.reduce((sum, tax) => sum + tax.assessedAmount, 0);
  const totalPaid = taxes.reduce((sum, tax) => sum + tax.amountPaid, 0);
  const totalDue = totalAssessed - totalPaid;

  doc.autoTable({
    startY: billInfoY + 28,
    head: [['Description', 'विवरण', 'Assessed', 'Paid', 'Amount Due']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74], // Green
      textColor: 255,
      fontStyle: 'bold',
    },
    didDrawPage: (data) => {
        // Footer on each page
        const pageCount = doc.internal.pages.length;
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
  });

  // 4. Totals Section
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  const totalX = pageWidth - 60;
  const totalValueX = pageWidth - 15;

  doc.text('Subtotal:', totalX, finalY + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(`₹${totalAssessed.toLocaleString('en-IN')}`, totalValueX, finalY + 10, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total Paid:', totalX, finalY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`- ₹${totalPaid.toLocaleString('en-IN')}`, totalValueX, finalY + 16, { align: 'right' });
  
  doc.setLineWidth(0.5);
  doc.line(totalX - 10, finalY + 20, totalValueX, finalY + 20);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Due:', totalX, finalY + 26);
  doc.text(`₹${totalDue.toLocaleString('en-IN')}`, totalValueX, finalY + 26, { align: 'right' });


  // 5. Footer & Remarks
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setLineWidth(0.5);
  doc.line(15, footerY, pageWidth - 15, footerY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated bill and does not require a signature.', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text(`Please make payments before the due date to avoid late fees of ${settings.lateFee}%.`, pageWidth / 2, footerY + 14, { align: 'center' });

  // Save the PDF
  doc.save(`Bill-${property.id}.pdf`);
};
