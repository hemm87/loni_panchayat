import React, { useMemo } from 'react';
import type { Property } from '@/lib/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardStats } from './DashboardStats';
import { RevenueChart } from './RevenueChart';
import { PropertyTypeChart } from './PropertyTypeChart';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { PendingActions } from './PendingActions';

interface DashboardPageProps {
  properties: Property[];
  onRegisterClick: () => void;
  onBillClick: () => void;
  onReportsClick: () => void;
}

/**
 * DashboardPage Component
 * Main dashboard view displaying statistics, charts, and quick actions
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  properties,
  onRegisterClick,
  onBillClick,
  onReportsClick,
}) => {
  const { stats, monthlyRevenueData, propertyTypeData } = useDashboardData(properties);

  // Get recent activities and pending properties
  const recentActivities = useMemo(() => {
    return properties
      .filter(p => p.taxes && p.taxes.length > 0)
      .flatMap(p => 
        p.taxes!.map(t => ({
          id: `${p.id}-${t.assessmentYear}`,
          propertyId: p.houseNo,
          ownerName: p.ownerName,
          action: t.paymentStatus === 'Paid' ? 'paid' as const : 'pending' as const,
          amount: t.amountPaid || t.assessedAmount,
          date: t.paymentDate || new Date().toISOString(),
          taxYear: t.assessmentYear.toString()
        }))
      )
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [properties]);

  const pendingProperties = useMemo(() => {
    return properties
      .filter(p => p.taxes?.some(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial'))
      .slice(0, 5);
  }, [properties]);

  return (
    <>
      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <RevenueChart data={monthlyRevenueData} />
        <PropertyTypeChart data={propertyTypeData} />
      </div>

      {/* Activity and Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <RecentActivity activities={recentActivities} />
        <PendingActions properties={pendingProperties} onBillClick={onBillClick} />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onRegisterClick={onRegisterClick}
        onBillClick={onBillClick}
        onReportsClick={onReportsClick}
      />
    </>
  );
};
