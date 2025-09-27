'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';
import type { Collection } from './types';

export function useCollection<T>(query: Query | null): Collection<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        setData(data);
        setSnapshot(querySnapshot);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error, snapshot };
}
