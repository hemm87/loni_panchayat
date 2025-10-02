
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PropertiesTable } from '@/components/properties/properties-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { NoPropertiesState } from '@/components/ui/empty-state';

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
  const router = useRouter();

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, loading: collectionLoading } = useCollection<Property>(propertiesQuery);
  
  if (collectionLoading) {
    return <PropertiesSkeleton />;
  }

  const handleAddNew = () => {
    // This is a bit of a hack. We should ideally have a dedicated page for adding new properties.
    // For now, we redirect to the dashboard which will show the registration form.
    // A better solution would be to use a modal or a separate page.
    // We can't easily switch the active menu on the dashboard from here.
    alert("Please go to the 'Register New User' tab on the main dashboard to add a new property.");
  }
  
  return (
    <div className="flex flex-col gap-8">
       <PageHeader
          title="Property Records"
          titleHi="संपत्ति रिकॉर्ड"
          description="View and manage all registered properties"
          descriptionHi="सभी पंजीकृत संपत्तियों को देखें और प्रबंधित करें"
          action={{
            label: "Add Property",
            labelHi: "संपत्ति जोड़ें",
            onClick: () => router.push('/?menu=register'), // A bit of a hack
            icon: <Plus className="w-5 h-5" />,
            variant: "default"
          }}
          showBackButton
          onBack={() => router.push('/dashboard')}
        />
        {properties && properties.length > 0 ? (
            <PropertiesTable data={properties || []} />
        ) : (
            <NoPropertiesState onAddNew={() => router.push('/?menu=register')} />
        )}
    </div>
  );
}

    