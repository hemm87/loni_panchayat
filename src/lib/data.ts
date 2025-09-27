import { getFirebase } from '@/firebase/provider';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Property, Payment, TaxRecord } from './types';

// The mock data is kept for reference but is no longer used by the app.
const MOCK_PROPERTIES: Property[] = [
  // ... (mock data remains here but is unused)
];

async function seedData() {
  const { firestore } = getFirebase();
  if (!firestore) throw new Error('Firestore not initialized');

  const propertiesRef = collection(firestore, 'properties');
  const snapshot = await getDocs(propertiesRef);

  if (snapshot.empty) {
    console.log('No properties found. Seeding mock data...');
    const { MOCK_PROPERTIES_FOR_SEED } = await import('@/lib/mock-seed');
    for (const property of MOCK_PROPERTIES_FOR_SEED) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(firestore, 'properties', property.id), property);
    }
    console.log('Mock data seeded.');
  } else {
    console.log('Properties collection already exists. Skipping seed.');
  }
}


export const getProperties = async (): Promise<Property[]> => {
  const { firestore } = getFirebase();
  if (!firestore) return [];
  
  await seedData();

  const propertiesCol = collection(firestore, 'properties');
  const propertiesSnapshot = await getDocs(propertiesCol);
  const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Property);
  return propertiesList;
};

export const getRecentPayments = async (): Promise<Payment[]> => {
  const properties = await getProperties();
  const payments: Payment[] = [];
  properties.forEach(p => {
    p.taxes?.forEach(t => {
      if (t.paymentStatus !== 'Unpaid' && t.paymentDate) {
        payments.push({
          id: t.id,
          ownerName: p.ownerName,
          propertyId: p.id,
          amount: t.amountPaid,
          date: t.paymentDate,
          taxType: t.taxType,
        });
      }
    });
  });
  return payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
};
