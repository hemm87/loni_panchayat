/**
 * Bills Summary Component
 * 
 * Displays aggregate statistics for filtered bills including:
 * - Total number of bills
 * - Total assessed amount
 * - Total collected amount
 * - Total pending amount
 */

'use client';

import { FileText, IndianRupee, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BillData } from '../hooks/useBillsData';

interface BillsSummaryProps {
  bills: BillData[];
}

/**
 * Displays summary statistics for bills
 */
export function BillsSummary({ bills }: BillsSummaryProps) {
  // Calculate summary from bills
  const summary = bills.reduce(
    (acc, bill) => {
      acc.totalBills++;
      acc.totalAssessed += bill.tax.assessedAmount;
      acc.totalCollected += bill.tax.amountPaid;
      acc.totalPending += bill.tax.assessedAmount - bill.tax.amountPaid;
      return acc;
    },
    {
      totalBills: 0,
      totalAssessed: 0,
      totalCollected: 0,
      totalPending: 0,
    }
  );

  const stats = [
    {
      title: 'Total Bills',
      value: summary.totalBills,
      icon: FileText,
      bgColor: 'from-primary to-blue-600',
      isRupee: false,
    },
    {
      title: 'Total Assessed',
      value: summary.totalAssessed,
      icon: IndianRupee,
      bgColor: 'from-info to-cyan-600',
      isRupee: true,
    },
    {
      title: 'Total Collected',
      value: summary.totalCollected,
      icon: CheckCircle2,
      bgColor: 'from-success to-emerald-600',
      isRupee: true,
    },
    {
      title: 'Total Pending',
      value: summary.totalPending,
      icon: AlertCircle,
      bgColor: 'from-destructive to-red-600',
      isRupee: true,
    },
  ];

  return (
    <div className="card-premium rounded-2xl p-6 border-2 border-border/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4">Bills Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card-premium rounded-xl p-4 border-2 border-border/30 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.bgColor} flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stat.isRupee && '₹'}
                {stat.isRupee
                  ? stat.value.toLocaleString('en-IN')
                  : stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
