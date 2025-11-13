
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import PDFDocument from "pdfkit";
import * as QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { localization } from "./localization";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const storage = getStorage();

interface GenerateBillPayload {
    propertyId: string;
    year: number;
    taxTypes: string[];
    language: 'en' | 'hi' | 'bilingual';
    paymentInfo?: {
        isPaid: boolean;
        paymentMethod: string;
        receiptNumber: string;
    }
}

interface TaxRecord {
    id: string;
    taxType: string;
    hindiName: string;
    assessedAmount: number;
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
    amountPaid: number;
    assessmentYear: number;
}

interface Property {
    id: string;
    ownerName: string;
    fatherName: string;
    mobileNumber: string;
    houseNo: string;
    address: string;
    aadhaarHash: string;
    propertyType: string;
    area: number;
    taxes: TaxRecord[];
}


export const generateBill = onCall(async (request) => {
    logger.info("generateBill function triggered");

    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const adminUid = request.auth.uid;
    const adminUserDoc = await db.collection("users").doc(adminUid).get();
    if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        throw new HttpsError("permission-denied", "You must be an admin to perform this action.");
    }

    const { propertyId, year, taxTypes, language, paymentInfo } = request.data as GenerateBillPayload;
    logger.info(`Generating bill for propertyId: ${propertyId}, year: ${year}`);

    // 1. Fetch Property Data
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    if (!propertyDoc.exists) {
        throw new HttpsError("not-found", `Property with ID ${propertyId} not found.`);
    }
    const propertyData = { id: propertyDoc.id, ...propertyDoc.data() } as Property;

    const taxesToInclude = propertyData.taxes.filter(tax =>
        tax.assessmentYear === year && taxTypes.includes(tax.taxType)
    );

    if (taxesToInclude.length === 0) {
        throw new HttpsError("not-found", `No applicable tax records found for the selected criteria.`);
    }

    const billId = `LONI-${year}-${uuidv4().split('-')[0].toUpperCase()}`;
    const generationDate = new Date();
    const dueDate = new Date(generationDate);
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    // 2. Generate PDF using pdfkit
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: any[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const writeStream = storage.bucket().file(`bills/${year}/${billId}.pdf`).createWriteStream({
        resumable: false,
        contentType: 'application/pdf',
    });

    doc.pipe(writeStream);

    // --- PDF Content ---
    const t = (key: keyof typeof localization) => localization[key][language] || localization[key]['en'];
    
    // Header
    doc.font('Helvetica-Bold').fontSize(18).text(t('panchayatName'), { align: 'center' });
    doc.font('Helvetica').fontSize(10).text(t('panchayatAddress'), { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text(t('taxBillTitle'), { align: 'center' });
    doc.lineCap('butt').moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    // Bill Meta
    doc.fontSize(10);
    doc.text(`${t('billNo')}: ${billId}`, { continued: true });
    doc.text(`${t('date')}: ${generationDate.toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.text(`${t('propertyId')}: ${propertyData.id}`, { continued: true });
    doc.text(`${t('dueDate')}: ${dueDate.toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown(2);

    // Owner Details
    doc.font('Helvetica-Bold').text(t('billTo'));
    doc.font('Helvetica').text(propertyData.ownerName);
    doc.text(`${t('fathersName')}: ${propertyData.fatherName}`);
    doc.text(`${t('address')}: ${propertyData.address}`);
    doc.text(`${t('houseNo')}: ${propertyData.houseNo}`);
    doc.text(`${t('mobile')}: ${propertyData.mobileNumber}`);
    doc.moveDown();

    // Tax Table
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text(t('srNo'), 50, tableTop);
    doc.text(t('taxType'), 80, tableTop);
    doc.text(t('assessedAmount'), 300, tableTop, { width: 90, align: 'right' });
    doc.text(t('amountPaid'), 400, tableTop, { width: 70, align: 'right' });
    doc.text(t('dueAmount'), 480, tableTop, { width: 70, align: 'right' });
    doc.y += 15;
    
    let totalAssessed = 0;
    let totalPaid = 0;
    
    doc.font('Helvetica');
    taxesToInclude.forEach((tax, i) => {
        const y = doc.y;
        doc.text(String(i + 1), 50, y);
        doc.text(`${tax.taxType} (${tax.hindiName})`, 80, y, { width: 220 });
        doc.text(`₹${tax.assessedAmount.toFixed(2)}`, 300, y, { width: 90, align: 'right' });
        doc.text(`₹${tax.amountPaid.toFixed(2)}`, 400, y, { width: 70, align: 'right' });
        const due = tax.assessedAmount - tax.amountPaid;
        doc.text(`₹${due.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
        totalAssessed += tax.assessedAmount;
        totalPaid += tax.amountPaid;
        doc.y += 15;
    });

    // Totals
    const totalDue = totalAssessed - totalPaid;
    doc.font('Helvetica-Bold');
    doc.y += 10;
    doc.text(t('total'), 80, doc.y);
    doc.text(`₹${totalAssessed.toFixed(2)}`, 300, doc.y, { width: 90, align: 'right' });
    doc.text(`₹${totalPaid.toFixed(2)}`, 400, doc.y, { width: 70, align: 'right' });
    doc.text(`₹${totalDue.toFixed(2)}`, 480, doc.y, { width: 70, align: 'right' });
    doc.moveDown(2);

    // QR Code
    const verificationUrl = `https://your-app-url.com/verify?billId=${billId}`; // Replace with your actual URL
    const qrCodeImage = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H' });
    doc.image(qrCodeImage, 50, doc.y, { fit: [80, 80] });

    // Footer
    doc.text(t('signature'), 400, doc.y + 20, {align: 'center', width: 150});
    doc.text(`(${t('secretary')})`, 400, doc.y + 15, {align: 'center', width: 150});

    doc.end();
    // --- End PDF Content ---


    // 3. Wait for PDF upload to finish
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    const pdfFile = storage.bucket().file(`bills/${year}/${billId}.pdf`);
    const signedUrl = await pdfFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // 4. Save to 'bills' collection
    const billDoc = {
        billId: billId,
        propertyId: propertyData.id,
        ownerName: propertyData.ownerName,
        houseNo: propertyData.houseNo,
        year: year,
        taxBreakdown: taxesToInclude,
        totalAmount: totalAssessed,
        amountPaid: totalPaid,
        status: paymentInfo?.isPaid ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid'),
        generatedBy: adminUid,
        generatedAt: generationDate,
        storageUrlPdf: `gs://${storage.bucket().name}/bills/${year}/${billId}.pdf`,
        downloadUrl: signedUrl[0],
        language: language,
    };
    await db.collection("bills").doc(billId).set(billDoc);
    
    // Optionally update tax records if marked as paid
    if (paymentInfo?.isPaid) {
        const updatedTaxes = propertyData.taxes.map(tax => {
            if (tax.assessmentYear === year && taxTypes.includes(tax.taxType)) {
                return {
                    ...tax,
                    amountPaid: tax.assessedAmount,
                    paymentStatus: 'Paid' as const,
                    receiptNumber: paymentInfo.receiptNumber,
                    paymentDate: generationDate.toISOString().split('T')[0]
                };
            }
            return tax;
        });
        await propertyRef.update({ taxes: updatedTaxes });
    }

    logger.info("Bill generated successfully", { billId: billId, downloadUrl: signedUrl[0] });

    return { success: true, billId: billId, downloadUrl: signedUrl[0] };
});
