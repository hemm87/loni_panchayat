import type {
  DocumentData,
  DocumentReference,
  Query,
  FirestoreError,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';

export type Collection<T> = {
  loading: boolean;
  data: T[] | null;
  error: FirestoreError | null;
  snapshot: QuerySnapshot<DocumentData> | null;
};

export type Document<T> = {
  loading: boolean;
  data: T | null;
  error: FirestoreError | null;
  snapshot: DocumentSnapshot<DocumentData> | null;
  reference: DocumentReference<DocumentData> | null;
};
