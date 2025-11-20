/**
 * Reports Page Component
 * 
 * Main container for reports section with:
 * - Excel Report Generator (Financial Year & Custom Date Range)
 * - Date range filters
 * - Report type selection
 * - Report generation and export
 * - Statistics and breakdowns
 */

'use client';

import { useState, useMemo } from 'react';
import { BarChart3, Search, Download, Home, FileText, AlertCircle } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportSummary } from './ReportSummary';
import { TaxBreakdown } from './TaxBreakdown';
import { PropertyBreakdown } from './PropertyBreakdown';
import { ReportGenerator } from './report-generator';
import { NoReportsState } from '@/components/ui/empty-state';
import type { Property } from '@/lib/types';

interface ReportsPageProps {
  properties: Property[];
}

/**
 * Main reports page container
 */
export function ReportsPage({ properties }: ReportsPageProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportType, setReportType] = useState('all');
  const [showReport, setShowReport] = useState(false);

  const generateReport = () => {
    setShowReport(true);
  };

  // Calculate report data
  const reportData = useMemo(() => {
    if (!properties || properties.length === 0) return null;

    const totalProperties = properties.length;
    const totalTaxes = properties.reduce((sum, prop) => {
      return sum + (prop.taxes?.reduce((taxSum, tax) => taxSum + tax.assessedAmount, 0) || 0);
    }, 0);

    const paidTaxes = properties.reduce((sum, prop) => {
      return sum + (prop.taxes?.reduce((taxSum, tax) => 
        taxSum + (tax.paymentStatus === 'Paid' ? tax.assessedAmount : tax.amountPaid), 0) || 0);
    }, 0);

    const pendingTaxes = totalTaxes - paidTaxes;

    const taxesByType = properties.reduce((acc, prop) => {
      prop.taxes?.forEach(tax => {
        if (!acc[tax.taxType]) {
          acc[tax.taxType] = { total: 0, paid: 0, pending: 0, count: 0 };
        }
        acc[tax.taxType].total += tax.assessedAmount;
        acc[tax.taxType].paid += tax.paymentStatus === 'Paid' ? tax.assessedAmount : tax.amountPaid;
        acc[tax.taxType].pending += tax.paymentStatus === 'Unpaid' ? tax.assessedAmount : 
          (tax.paymentStatus === 'Partial' ? tax.assessedAmount - tax.amountPaid : 0);
        acc[tax.taxType].count++;
      });
      return acc;
    }, {} as Record<string, { total: number; paid: number; pending: number; count: number }>);

    const propertyTypeBreakdown = properties.reduce((acc, prop) => {
      acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProperties,
      totalTaxes,
      paidTaxes,
      pendingTaxes,
      collectionRate: totalTaxes > 0 ? (paidTaxes / totalTaxes) * 100 : 0,
      taxesByType,
      propertyTypeBreakdown,
    };
  }, [properties]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-premium rounded-2xl shadow-xl p-6 md:p-10 border-2 border-border/50 backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Reports & Analytics
            </h2>
            <p className="text-lg text-muted-foreground mt-1">रिपोर्ट्स और विश्लेषण</p>
          </div>
        </div>
      </div>

      {/* Excel Report Generator - NEW FEATURE */}
      <ReportGenerator />

      {/* Header and Filters */}
      <div className="card-premium rounded-2xl shadow-xl p-6 md:p-10 border-2 border-border/50 backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-primary">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
              Visual Analytics
            </h2>
            <p className="text-base text-muted-foreground mt-1">दृश्य विश्लेषण</p>
          </div>
        </div>

        <ReportFilters
          fromDate={fromDate}
          toDate={toDate}
          reportType={reportType}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onReportTypeChange={setReportType}
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={generateReport}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-8 h-14 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <Search className="w-6 h-6" />
            <span>Generate Report • रिपोर्ट बनाएँ</span>
          </button>
          <button 
            onClick={() => window.print()}
            disabled={!showReport || !reportData}
            className="px-8 h-14 bg-success text-white rounded-xl font-bold text-lg hover:bg-success/90 hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Download className="w-6 h-6" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Results */}
      {showReport && reportData ? (
        <div className="space-y-6 animate-fade-in">
          <ReportSummary reportData={reportData} />
          <TaxBreakdown taxesByType={reportData.taxesByType} />
          <PropertyBreakdown 
            propertyTypeBreakdown={reportData.propertyTypeBreakdown}
            totalProperties={reportData.totalProperties}
          />
        </div>
      ) : showReport && !reportData ? (
        <NoReportsState />
      ) : null}
    </div>
  );
}
