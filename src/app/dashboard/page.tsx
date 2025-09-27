import { getProperties, getRecentPayments } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TaxStatusChart } from '@/components/dashboard/tax-status-chart';
import AiFeedback from '@/components/dashboard/ai-feedback';
import { RecentPayments } from '@/components/dashboard/recent-payments';
import type { Property, TaxRecord } from '@/lib/types';

export default async function DashboardPage() {
  const properties: Property[] = await getProperties();
  const recentPayments = await getRecentPayments();

  const allTaxes: TaxRecord[] = properties.flatMap(p => p.taxes);

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
    // Mocked data for other AI inputs
    lowAssessmentAmount: allTaxes.filter(t => t.assessedAmount < 1000).length,
    highAssessmentAmount: allTaxes.filter(t => t.assessedAmount > 20000).length,
    incompletePropertyData: 0, // Assuming all mock data is complete
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
