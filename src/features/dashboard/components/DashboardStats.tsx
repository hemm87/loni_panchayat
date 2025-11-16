import React from 'react';
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
      icon: '👥' 
    },
    { 
      title: 'Fully Paid', 
      titleHi: 'पूर्ण भुगतान', 
      value: stats.paidTaxes.toLocaleString('en-IN'), 
      color: 'bg-green-500', 
      icon: '✅' 
    },
    { 
      title: 'Dues Pending', 
      titleHi: 'बकाया लंबित', 
      value: stats.pendingTaxes.toLocaleString('en-IN'), 
      color: 'bg-orange-500', 
      icon: '⏳' 
    },
    { 
      title: 'Total Revenue', 
      titleHi: 'कुल राजस्व', 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
      color: 'bg-purple-500', 
      icon: '💰' 
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
        />
      ))}
    </div>
  );
};
