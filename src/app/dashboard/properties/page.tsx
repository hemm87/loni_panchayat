
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, isLoading: collectionLoading } = useCollection<Property>(propertiesQuery);
  
  if (collectionLoading) {
    return <PropertiesSkeleton />;
  }

  const handleAddNew = () => {
    router.push('/dashboard?menu=register');
  }
  
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
       <PageHeader
          title="Property Records"
          titleHi="संपत्ति रिकॉर्ड"
          description="View and manage all registered properties"
          descriptionHi="सभी पंजीकृत संपत्तियों को देखें और प्रबंधित करें"
          action={{
            label: "Add Property",
            labelHi: "संपत्ति जोड़ें",
            onClick: handleAddNew,
            icon: <Plus className="w-5 h-5" />,
            variant: "default"
          }}
          showBackButton
          onBack={() => router.push('/dashboard')}
        />
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
          <div className="card-premium p-5 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Properties</p>
            <p className="text-3xl md:text-4xl font-bold text-primary">{properties?.length || 0}</p>
          </div>
          <div className="card-premium p-5 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-success" style={{ animationDelay: '50ms' }}>
            <p className="text-sm font-medium text-muted-foreground mb-2">All Paid</p>
            <p className="text-3xl md:text-4xl font-bold text-success">
              {properties?.filter(p => p.taxes?.every(t => t.paymentStatus === 'Paid')).length || 0}
            </p>
          </div>
          <div className="card-premium p-5 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-warning" style={{ animationDelay: '100ms' }}>
            <p className="text-sm font-medium text-muted-foreground mb-2">Partial</p>
            <p className="text-3xl md:text-4xl font-bold text-warning">
              {properties?.filter(p => p.taxes?.some(t => t.paymentStatus === 'Partial')).length || 0}
            </p>
          </div>
          <div className="card-premium p-5 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-destructive" style={{ animationDelay: '150ms' }}>
            <p className="text-sm font-medium text-muted-foreground mb-2">Unpaid</p>
            <p className="text-3xl md:text-4xl font-bold text-destructive">
              {properties?.filter(p => p.taxes?.some(t => t.paymentStatus === 'Unpaid')).length || 0}
            </p>
          </div>
        </div>
        {properties && properties.length > 0 ? (
            <PropertiesTable data={properties || []} />
        ) : (
            <NoPropertiesState onAddNew={handleAddNew} />
        )}
    </div>
  );
}
