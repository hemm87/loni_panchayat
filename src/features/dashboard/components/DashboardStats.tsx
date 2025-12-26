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
      sparklineData: stats.sparklineData
    },
    { 
      title: 'Fully Paid', 
      titleHi: 'पूर्ण भुगतान', 
      value: stats.paidTaxes.toLocaleString('en-IN'), 
      color: 'bg-green-500', 
      icon: Check,
      sparklineData: stats.sparklineData
    },
    { 
      title: 'Dues Pending', 
      titleHi: 'बकाया लंबित', 
      value: stats.pendingTaxes.toLocaleString('en-IN'), 
      color: 'bg-orange-500', 
      icon: Clock,
      sparklineData: stats.sparklineData
    },
    { 
      title: 'Total Revenue', 
      titleHi: 'कुल राजस्व', 
      value: `Rs. ${stats.totalRevenue.toLocaleString('en-IN')}`, 
      color: 'bg-purple-500', 
      icon: IndianRupee,
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
          sparklineData={stat.sparklineData}
        />
      ))}
    </div>
  );
};
