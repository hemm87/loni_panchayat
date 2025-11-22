import React from 'react';
import { Building2, Check, Clock, IndianRupee } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import type { DashboardStats as DashboardStatsType } from '../hooks/useDashboardData';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

/**
 * DashboardStats Component
 * Displays key statistics cards for the dashboard overview
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statsCards = [
    { 
      title: 'Total Properties', 
      titleHi: 'कुल संपत्ति', 
      value: stats.totalUsers.toLocaleString('en-IN'), 
      color: 'bg-blue-500', 
      icon: Building2,
      trend: stats.totalUsers > 0 ? { value: 5, isPositive: true } : undefined
    },
    { 
      title: 'Fully Paid', 
      titleHi: 'पूर्ण भुगतान', 
      value: stats.paidTaxes.toLocaleString('en-IN'), 
      color: 'bg-green-500', 
      icon: Check,
      trend: stats.paidTrend ? { value: stats.paidTrend, isPositive: stats.paidTrend >= 50 } : undefined,
      sparklineData: stats.sparklineData
    },
    { 
      title: 'Dues Pending', 
      titleHi: 'बकाया लंबित', 
      value: stats.pendingTaxes.toLocaleString('en-IN'), 
      color: 'bg-orange-500', 
      icon: Clock,
      trend: stats.pendingTrend ? { value: stats.pendingTrend, isPositive: stats.pendingTrend <= 30 } : undefined,
      sparklineData: stats.sparklineData
    },
    { 
      title: 'Total Revenue', 
      titleHi: 'कुल राजस्व', 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
      color: 'bg-purple-500', 
      icon: IndianRupee,
      trend: stats.revenueTrend ? { value: Math.abs(stats.revenueTrend), isPositive: stats.revenueTrend > 0 } : undefined,
      sparklineData: stats.sparklineData
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {statsCards.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          titleHi={stat.titleHi}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          sparklineData={stat.sparklineData}
        />
      ))}
    </div>
  );
};
