import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

export function initializeFirebase(firebaseConfig: FirebaseOptions) {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    // @ts-ignore
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, `http://${host}:9099`, {
        disableWarnings: true,
      });
    }
    // @ts-ignore
    if (!firestore.emulatorConfig) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return { app, auth, firestore };
}

export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore, getFirebase } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export type { Document, Collection } from './firestore/types';
