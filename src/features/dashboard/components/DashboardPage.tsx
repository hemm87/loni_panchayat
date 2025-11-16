import React from 'react';
import type { Property } from '@/lib/types';
import { UserRoleDisplay } from '@/components/ui/user-role-display';
import { AdminRoleFixer } from '@/components/ui/admin-role-fixer';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardStats } from './DashboardStats';
import { RevenueChart } from './RevenueChart';
import { PropertyTypeChart } from './PropertyTypeChart';
import { QuickActions } from './QuickActions';

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

  return (
    <>
      {/* User Role & Permissions Display */}
      <div className="mb-6 md:mb-8 animate-fade-in space-y-4">
        <UserRoleDisplay />
        <AdminRoleFixer />
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <RevenueChart data={monthlyRevenueData} />
        <PropertyTypeChart data={propertyTypeData} />
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
