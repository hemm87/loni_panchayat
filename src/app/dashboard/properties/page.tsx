'use client';
import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PropertiesTable } from '@/components/properties/properties-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/lib/types';

function PropertiesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
       <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
       <div className="flex items-center justify-between py-4 gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-28" />
       </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

export default function PropertiesPage() {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(true);

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, loading: collectionLoading } = useCollection<Property>(propertiesQuery);
  
  useEffect(() => {
    // Only set loading to false once the initial data fetch is complete
    if (!collectionLoading) {
      setLoading(false);
    }
  }, [collectionLoading]);

  if (loading) {
    return <PropertiesSkeleton />;
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Property Records
        </h1>
        <p className="text-muted-foreground">
          View and manage all properties in the system.
        </p>
      </div>
      <PropertiesTable data={properties || []} />
    </div>
  );
}

    