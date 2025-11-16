/**
 * Report Summary Component
 * 
 * Displays summary statistics:
 * - Total Properties
 * - Total Tax Assessed
 * - Collected Amount
 * - Pending Amount
 * - Collection Rate Progress Bar
 */

'use client';

import { Home, FileText, Download, AlertCircle, BarChart3 } from 'lucide-react';

interface ReportData {
  totalProperties: number;
  totalTaxes: number;
  paidTaxes: number;
  pendingTaxes: number;
  collectionRate: number;
}

interface ReportSummaryProps {
  reportData: ReportData;
}

/**
 * Summary cards and collection rate
 */
export function ReportSummary({ reportData }: ReportSummaryProps) {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Properties</h3>
            <Home className="w-8 h-8 text-primary" />
          </div>
          <p className="text-4xl font-headline font-bold text-primary">{reportData.totalProperties}</p>
          <p className="text-xs text-muted-foreground mt-2">संपत्तियों की कुल संख्या</p>
        </div>

        <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 border-2 border-success/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Tax Assessed</h3>
            <FileText className="w-8 h-8 text-success" />
          </div>
          <p className="text-4xl font-headline font-bold text-success">₹{reportData.totalTaxes.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-2">कुल कर निर्धारित</p>
        </div>

        <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-2xl p-6 border-2 border-info/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Collected</h3>
            <Download className="w-8 h-8 text-info" />
          </div>
          <p className="text-4xl font-headline font-bold text-info">₹{reportData.paidTaxes.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-2">एकत्रित कर</p>
        </div>

        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-6 border-2 border-warning/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Pending</h3>
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <p className="text-4xl font-headline font-bold text-warning">₹{reportData.pendingTaxes.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-2">लंबित कर</p>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
        <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-success" />
          </div>
          Collection Rate • संग्रह दर
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted/30 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-success to-success/80 h-full flex items-center justify-end px-4 transition-all duration-1000"
                style={{ width: `${Math.min(reportData.collectionRate, 100)}%` }}
              >
                <span className="text-white font-bold text-sm">{reportData.collectionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {reportData.collectionRate >= 75 ? '✅ Excellent collection rate!' : 
             reportData.collectionRate >= 50 ? '⚠️ Good, but can improve' : 
             '❌ Needs immediate attention'}
          </p>
        </div>
      </div>
    </>
  );
}
