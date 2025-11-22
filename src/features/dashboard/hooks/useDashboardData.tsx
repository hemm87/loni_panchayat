import { useMemo } from 'react';
import type { Property } from '@/lib/types';

export interface DashboardStats {
  totalUsers: number;
  paidTaxes: number;
  pendingTaxes: number;
  totalRevenue: number;
  paidTrend?: number; // percentage change
  pendingTrend?: number;
  revenueTrend?: number;
  sparklineData?: Array<{ month: string; value: number }>; // for mini charts
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface PropertyTypeData {
  name: string;
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyRevenueData: MonthlyRevenueData[];
  propertyTypeData: PropertyTypeData[];
}

/**
 * Custom hook for calculating dashboard statistics and chart data
 * @param properties - Array of property records
 * @returns Dashboard statistics and visualization data
 */
export const useDashboardData = (properties: Property[] | undefined): DashboardData => {
  return useMemo(() => {
    if (!properties || properties.length === 0) {
      return {
        stats: {
          totalUsers: 0,
          paidTaxes: 0,
          pendingTaxes: 0,
          totalRevenue: 0,
        },
        monthlyRevenueData: [],
        propertyTypeData: [],
      };
    }

    const totalUsers = properties.length;
    let paidTaxes = 0;
    let pendingTaxes = 0;
    let totalRevenue = 0;
    let previousMonthRevenue = 0;
    const monthlyRevenue: { [key: string]: number } = {};
    const propertyTypes: { [key: string]: number } = { 
      Residential: 0, 
      Commercial: 0, 
      Agricultural: 0 
    };
    const revenueByMonth: { [key: string]: number } = {};

    properties.forEach(prop => {
      // Count property types
      if (propertyTypes[prop.propertyType] !== undefined) {
        propertyTypes[prop.propertyType]++;
      }

      // Determine payment status
      const hasUnpaid = prop.taxes?.some(
        t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial'
      );
      if (hasUnpaid) {
        pendingTaxes++;
      } else if (prop.taxes?.length > 0) {
        paidTaxes++;
      }

      // Calculate revenue and monthly distribution
      prop.taxes?.forEach(tax => {
        totalRevenue += tax.amountPaid;
        if (tax.paymentDate) {
          const month = new Date(tax.paymentDate).toLocaleString('default', { 
            month: 'short' 
          });
          if (monthlyRevenue[month]) {
            monthlyRevenue[month] += tax.amountPaid;
          } else {
            monthlyRevenue[month] = tax.amountPaid;
          }
        }
      });
    });

    // Transform to chart-friendly formats
    const monthlyRevenueData = Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month],
    }));

    const propertyTypeData = Object.keys(propertyTypes).map(name => ({
      name,
      value: propertyTypes[name],
    }));

    // Calculate trends (simplified - last month vs average)
    const revenueTrend = monthlyRevenueData.length > 1 
      ? ((monthlyRevenueData[monthlyRevenueData.length - 1].revenue - monthlyRevenueData[0].revenue) / monthlyRevenueData[0].revenue * 100)
      : 0;
    
    const paidTrend = totalUsers > 0 ? (paidTaxes / totalUsers * 100) : 0;
    const pendingTrend = totalUsers > 0 ? (pendingTaxes / totalUsers * 100) : 0;

    // Sparkline data (last 6 months)
    const sparklineData = monthlyRevenueData.slice(-6).map(d => ({
      month: d.month,
      value: d.revenue
    }));

    return {
      stats: {
        totalUsers,
        paidTaxes,
        pendingTaxes,
        totalRevenue,
        paidTrend,
        pendingTrend,
        revenueTrend,
        sparklineData,
      },
      monthlyRevenueData,
      propertyTypeData,
    };
  }, [properties]);
};
