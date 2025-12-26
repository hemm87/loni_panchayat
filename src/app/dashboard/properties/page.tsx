
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PropertiesTable } from '@/components/properties/properties-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Property } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { useRouter } from 'next/navigation';
import { Plus, Building2, CheckCircle2, Clock, AlertCircle, TrendingUp, Users, IndianRupee } from 'lucide-react';
import { NoPropertiesState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';

function PropertiesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
       <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
       <div className="flex items-center justify-between py-4 gap-4">
        <Skeleton className="h-12 flex-1 max-w-md" />
        <Skeleton className="h-12 w-32" />
       </div>
      <Skeleton className="h-[500px] w-full rounded-2xl" />
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
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (!properties) return { total: 0, allPaid: 0, partial: 0, unpaid: 0, totalRevenue: 0, totalPending: 0 };
    
    let totalRevenue = 0;
    let totalPending = 0;
    
    properties.forEach(p => {
      p.taxes?.forEach(t => {
        totalRevenue += t.amountPaid;
        totalPending += t.assessedAmount - t.amountPaid;
      });
    });

    return {
      total: properties.length,
      allPaid: properties.filter(p => p.taxes?.every(t => t.paymentStatus === 'Paid')).length,
      partial: properties.filter(p => p.taxes?.some(t => t.paymentStatus === 'Partial')).length,
      unpaid: properties.filter(p => p.taxes?.some(t => t.paymentStatus === 'Unpaid')).length,
      totalRevenue,
      totalPending
    };
  }, [properties]);
  
  if (collectionLoading) {
    return <PropertiesSkeleton />;
  }

  const handleAddNew = () => {
    router.push('/dashboard?menu=register');
  }
  
  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fade-in">
      {/* Page Header */}
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
        
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-slide-up">
        {/* Total Properties */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">Total Properties</p>
        </Card>

        {/* All Paid */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.allPaid}</p>
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mt-1">Fully Paid</p>
        </Card>

        {/* Partial */}
        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.partial}</p>
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mt-1">Partial Payment</p>
        </Card>

        {/* Unpaid */}
        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.unpaid}</p>
          <p className="text-xs font-medium text-red-700 dark:text-red-300 mt-1">Unpaid Dues</p>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Rs. {stats.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-1">Collected</p>
        </Card>

        {/* Pending Amount */}
        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
            Rs. {stats.totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mt-1">Pending</p>
        </Card>
      </div>

      {/* Properties Table */}
      {properties && properties.length > 0 ? (
        <PropertiesTable data={properties || []} />
      ) : (
        <NoPropertiesState onAddNew={handleAddNew} />
      )}
    </div>
  );
}
