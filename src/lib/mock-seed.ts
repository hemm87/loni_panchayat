
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';
import type { Property } from './types';
import { getTaxHindiName } from './utils';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const properties: Omit<Property, 'id'>[] = [
    {
        ownerName: "Amit Sharma",
        fatherName: "Rajesh Sharma",
        mobileNumber: "9876543210",
        houseNo: "H-101",
        address: "Gandhi Nagar, Loni",
        aadhaarHash: "123456789012",
        propertyType: 'Residential',
        area: 1200,
        photoUrl: 'https://picsum.photos/seed/prop1/600/400',
        photoHint: "modern house",
        taxes: [
            {
                id: `TAX${Date.now()}1`,
                taxType: 'Property Tax',
                hindiName: getTaxHindiName('Property Tax'),
                assessedAmount: 1200,
                paymentStatus: 'Paid',
                amountPaid: 1200,
                assessmentYear: 2024,
                paymentDate: '2024-06-15',
                receiptNumber: 'REC2024001',
                baseAmount: 1200,
            },
            {
                id: `TAX${Date.now()}2`,
                taxType: 'Water Tax',
                hindiName: getTaxHindiName('Water Tax'),
                assessedAmount: 500,
                paymentStatus: 'Paid',
                amountPaid: 500,
                assessmentYear: 2024,
                paymentDate: '2024-07-10',
                receiptNumber: 'REC2024002',
                baseAmount: 500,
            },
        ],
    },
    {
        ownerName: "Sunita Devi",
        fatherName: "Mahesh Singh",
        mobileNumber: "9988776655",
        houseNo: "S-202",
        address: "Main Bazar, Loni",
        aadhaarHash: "234567890123",
        propertyType: 'Commercial',
        area: 800,
        photoUrl: 'https://picsum.photos/seed/prop2/600/400',
        photoHint: "storefront building",
        taxes: [
            {
                id: `TAX${Date.now()}3`,
                taxType: 'Property Tax',
                hindiName: getTaxHindiName('Property Tax'),
                assessedAmount: 2500,
                paymentStatus: 'Partial',
                amountPaid: 1000,
                assessmentYear: 2024,
                paymentDate: '2024-05-20',
                receiptNumber: 'REC2024003',
                baseAmount: 2500,
            },
        ],
    },
    {
        ownerName: "Vikas Kumar",
        fatherName: "Suresh Kumar",
        mobileNumber: "9123456789",
        houseNo: "F-30",
        address: "Khet Road, Loni",
        aadhaarHash: "345678901234",
        propertyType: 'Agricultural',
        area: 50000,
        photoUrl: 'https://picsum.photos/seed/prop3/600/400',
        photoHint: "farm field",
        taxes: [
            {
                id: `TAX${Date.now()}4`,
                taxType: 'Land Tax',
                hindiName: getTaxHindiName('Land Tax'),
                assessedAmount: 500,
                paymentStatus: 'Unpaid',
                amountPaid: 0,
                assessmentYear: 2024,
                paymentDate: null,
                receiptNumber: null,
                baseAmount: 500,
            },
        ],
    },
    {
        ownerName: "Rajesh Gupta",
        fatherName: "Ram Gupta",
        mobileNumber: "9876501234",
        houseNo: "R-45",
        address: "Station Road, Loni",
        aadhaarHash: "456789012345",
        propertyType: 'Residential',
        area: 1500,
        photoUrl: 'https://picsum.photos/seed/prop4/600/400',
        photoHint: "duplex house",
        taxes: [
            {
                id: `TAX${Date.now()}5`,
                taxType: 'Property Tax',
                hindiName: getTaxHindiName('Property Tax'),
                assessedAmount: 1800,
                paymentStatus: 'Unpaid',
                amountPaid: 0,
                assessmentYear: 2024,
                paymentDate: null,
                receiptNumber: null,
                baseAmount: 1800,
            },
            {
                id: `TAX${Date.now()}6`,
                taxType: 'Water Tax',
                hindiName: getTaxHindiName('Water Tax'),
                assessedAmount: 600,
                paymentStatus: 'Unpaid',
                amountPaid: 0,
                assessmentYear: 2024,
                paymentDate: null,
                receiptNumber: null,
                baseAmount: 600,
            },
        ],
    },
    {
        ownerName: "Priya Singh",
        fatherName: "Anil Singh",
        mobileNumber: "9988123456",
        houseNo: "P-12",
        address: "Market Area, Loni",
        aadhaarHash: "567890123456",
        propertyType: 'Commercial',
        area: 600,
        photoUrl: 'https://picsum.photos/seed/prop5/600/400',
        photoHint: "shop building",
        taxes: [
            {
                id: `TAX${Date.now()}7`,
                taxType: 'Property Tax',
                hindiName: getTaxHindiName('Property Tax'),
                assessedAmount: 3000,
                paymentStatus: 'Paid',
                amountPaid: 3000,
                assessmentYear: 2024,
                paymentDate: '2024-04-25',
                receiptNumber: 'REC2024004',
                baseAmount: 3000,
            },
        ],
    },
];

const seedFirestore = async () => {
  try {
    console.log('Starting to seed Firestore...');
    const batch = writeBatch(db);
    const propertiesCollection = collection(db, 'properties');

    properties.forEach((prop) => {
      const docId = `PROP${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const docRef = doc(propertiesCollection, docId);
      batch.set(docRef, prop);
    });

    await batch.commit();
    console.log(`✅ Firestore seeded successfully with ${properties.length} properties!`);
  } catch (error) {
    console.error('🔥 Error seeding Firestore:', error);
  } finally {
    // Exit the script
    process.exit(0);
  }
};

seedFirestore();
