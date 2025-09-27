'use client';

import { FirebaseProvider, setFirebase } from './provider';
import { initializeFirebase } from '.';
import { firebaseConfig } from './config';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = initializeFirebase(firebaseConfig);
  setFirebase(app, auth, firestore);

  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
      {children}
    </FirebaseProvider>
  );
}
