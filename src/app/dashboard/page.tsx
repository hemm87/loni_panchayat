'use client';
import { useEffect, useState } from 'react';
import { getProperties, getRecentPayments } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TaxStatusChart } from '@/components/dashboard/tax-status-chart';
import AiFeedback from '@/components/dashboard/ai-feedback';
import { RecentPayments } from '@/components/dashboard/recent-payments';
import type { Property, TaxRecord, Payment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Skeleton className="lg:col-span-3 h-[450px]" />
        <Skeleton className="lg:col-span-2 h-[450px]" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}


export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [props, payments] = await Promise.all([
        getProperties(),
        getRecentPayments()
      ]);
      setProperties(props);
      setRecentPayments(payments);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const allTaxes: TaxRecord[] = properties.flatMap(p => p.taxes || []);

  const totalProperties = properties.length;
  const totalAssessedValue = allTaxes.reduce(
    (sum, tax) => sum + tax.assessedAmount,
    0
  );
  const totalCollected = allTaxes.reduce(
    (sum, tax) => sum + tax.amountPaid,
    0
  );
  const pendingTaxesCount = allTaxes.filter(
    t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial'
  ).length;

  const statsForAI = {
    totalProperties: totalProperties,
    pendingTaxes: allTaxes.filter(t => t.paymentStatus !== 'Paid').length,
    paidTaxes: allTaxes.filter(t => t.paymentStatus === 'Paid').length,
    lowAssessmentAmount: allTaxes.filter(t => t.assessedAmount < 1000).length,
    highAssessmentAmount: allTaxes.filter(t => t.assessedAmount > 20000).length,
    incompletePropertyData: properties.filter(p => !p.ownerName || !p.area).length,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of tax collection and property management.
        </p>
      </div>

      <StatsCards
        totalProperties={totalProperties}
        totalAssessedValue={totalAssessedValue}
        totalCollected={totalCollected}
        pendingTaxesCount={pendingTaxesCount}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TaxStatusChart taxes={allTaxes} />
        </div>
        <div className="lg:col-span-2">
          <AiFeedback stats={statsForAI} />
        </div>
      </div>
      
      <RecentPayments payments={recentPayments} />
    </div>
  );
}
