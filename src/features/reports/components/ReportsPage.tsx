/**
 * Reports Page Component
 * 
 * Main container for reports section with:
 * - Financial Year Excel Report Generator
 * - Visual Analytics Dashboard
 * - Real-time Statistics and Charts
 */

'use client';

import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FileText, PieChart, Activity } from 'lucide-react';
import { ReportGenerator } from './report-generator-new';
import { Card } from '@/components/ui/card';
import type { Property } from '@/lib/types';

interface ReportsPageProps {
  properties: Property[];
}

/**
 * Main reports page container with Excel generator and visual analytics
 */
export function ReportsPage({ properties }: ReportsPageProps) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!properties || properties.length === 0) {
      return {
        totalProperties: 0,
        totalRevenue: 0,
        totalCollected: 0,
        totalPending: 0,
        collectionRate: 0,
        taxByType: {} as Record<string, { total: number; collected: number; pending: number }>,
        propertyByType: {} as Record<string, number>,
        recentPayments: [] as Array<{ date: string; amount: number; property: string }>,
      };
    }

    const totalProperties = properties.length;
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalPending = 0;
    const taxByType: Record<string, { total: number; collected: number; pending: number }> = {};
    const propertyByType: Record<string, number> = {};
    const recentPayments: Array<{ date: string; amount: number; property: string; owner: string }> = [];

    properties.forEach(property => {
      // Property type breakdown
      propertyByType[property.propertyType] = (propertyByType[property.propertyType] || 0) + 1;

      // Tax calculations
      property.taxes?.forEach(tax => {
        const amount = tax.assessedAmount || 0;
        const paid = tax.amountPaid || 0;
        const pending = amount - paid;

        totalRevenue += amount;
        totalCollected += paid;
        totalPending += pending;

        // Tax type breakdown
        if (!taxByType[tax.taxType]) {
          taxByType[tax.taxType] = { total: 0, collected: 0, pending: 0 };
        }
        taxByType[tax.taxType].total += amount;
        taxByType[tax.taxType].collected += paid;
        taxByType[tax.taxType].pending += pending;

        // Recent payments
        if (tax.paymentDate && tax.paymentStatus !== 'Unpaid') {
          recentPayments.push({
            date: tax.paymentDate,
            amount: paid,
            property: property.id,
            owner: property.ownerName,
          });
        }
      });
    });

    // Sort recent payments by date
    recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

    return {
      totalProperties,
      totalRevenue,
      totalCollected,
      totalPending,
      collectionRate,
      taxByType,
      propertyByType,
      recentPayments: recentPayments.slice(0, 5),
    };
  }, [properties]);

  return (
    <div className="space-y-6">
      {/* Excel Report Generator */}
      <ReportGenerator />

      {/* Visual Analytics Section */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Visual Analytics Dashboard</h2>
            <p className="text-sm text-muted-foreground">दृश्य विश्लेषण डैशबोर्ड • Real-time insights</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalProperties}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Properties Registered</div>
            <div className="text-xs text-blue-600 mt-1">पंजीकृत संपत्तियां</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-5 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded-full">Revenue</span>
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">Total Tax Revenue</div>
            <div className="text-xs text-green-600 mt-1">कुल कर राजस्व</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">{analytics.collectionRate.toFixed(1)}%</span>
            </div>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              ₹{analytics.totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Collected Amount</div>
            <div className="text-xs text-emerald-600 mt-1">एकत्रित राशि</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-5 rounded-xl border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <span className="text-xs font-semibold text-red-600 bg-red-200 px-2 py-1 rounded-full">Pending</span>
            </div>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">
              ₹{analytics.totalPending.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1">Pending Amount</div>
            <div className="text-xs text-red-600 mt-1">बकाया राशि</div>
          </div>
        </div>

        {/* Tax Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-5 rounded-xl border-2 border-border">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Tax Type Breakdown • कर प्रकार विभाजन</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.taxByType).map(([type, data]) => {
                const percentage = analytics.totalRevenue > 0 ? (data.total / analytics.totalRevenue) * 100 : 0;
                const collectionRate = data.total > 0 ? (data.collected / data.total) * 100 : 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">₹{data.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% of total</span>
                      <span className={collectionRate >= 70 ? 'text-green-600' : 'text-orange-600'}>
                        {collectionRate.toFixed(1)}% collected
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Property Type Distribution */}
          <div className="bg-muted/30 p-5 rounded-xl border-2 border-border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Property Distribution • संपत्ति वितरण</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.propertyByType).map(([type, count]) => {
                const percentage = analytics.totalProperties > 0 ? (count / analytics.totalProperties) * 100 : 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">{count} properties</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total properties
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        {analytics.recentPayments.length > 0 && (
          <div className="mt-6 bg-muted/30 p-5 rounded-xl border-2 border-border">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Recent Payments • हाल की भुगतान</h3>
            </div>
            <div className="space-y-2">
              {analytics.recentPayments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary/50 transition-all">
                  <div>
                    <div className="font-medium text-sm">{payment.owner}</div>
                    <div className="text-xs text-muted-foreground">{payment.property}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
