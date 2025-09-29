import { getFirebase } from '@/firebase/provider';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { Property, Payment, TaxRecord } from './types';

async function seedDataIfEmpty() {
  const { firestore } = getFirebase();
  if (!firestore) throw new Error('Firestore not initialized');

  const propertiesRef = collection(firestore, 'properties');
  const q = query(propertiesRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('No properties found. Seeding mock data...');
    const { MOCK_PROPERTIES_FOR_SEED } = await import('@/lib/mock-seed');
    const { doc, setDoc, writeBatch } = await import('firebase/firestore');

    const batch = writeBatch(firestore);
    MOCK_PROPERTIES_FOR_SEED.forEach(property => {
      const docRef = doc(firestore, 'properties', property.id);
      batch.set(docRef, property);
    });
    await batch.commit();

    console.log('Mock data seeded.');
  }
}

// Ensure data is seeded only once
const seedPromise = seedDataIfEmpty();

export const getProperties = async (): Promise<Property[]> => {
  await seedPromise;
  const { firestore } = getFirebase();
  if (!firestore) return [];
  
  const propertiesCol = collection(firestore, 'properties');
  const propertiesSnapshot = await getDocs(propertiesCol);
  const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Property);
  return propertiesList;
};

export const getRecentPayments = async (): Promise<Payment[]> => {
  const properties = await getProperties();
  const payments: Payment[] = [];
  properties.forEach(p => {
    if (p.taxes) {
      p.taxes.forEach(t => {
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
    }
  });
  return payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
};
