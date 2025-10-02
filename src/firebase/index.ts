
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase(firebaseConfig: FirebaseOptions) {
  if (typeof window === 'undefined') {
    // On the server, we need to check if the app is already initialized.
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  } else {
    // On the client, we can just initialize the app.
    // The `FirebaseClientProvider` will make sure this is only done once.
    app = initializeApp(firebaseConfig);
  }

  auth = getAuth(app);
  firestore = getFirestore(app);

  return { app, auth, firestore };
}

export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore, getFirebase, setFirebase } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export type { Document, Collection } from './firestore/types';
