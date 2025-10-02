
'use client';

import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import { firebaseConfig } from './config';

// This component is a bit of a hack to make sure that the Firebase services
// are initialized on the client and only once.
let firebaseApp: ReturnType<typeof initializeFirebase> | null = null;
function getFirebaseApp() {
    if (firebaseApp) {
        return firebaseApp;
    }
    firebaseApp = initializeFirebase(firebaseConfig);
    return firebaseApp;
}

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = getFirebaseApp();

  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
      {children}
    </FirebaseProvider>
  );
}
