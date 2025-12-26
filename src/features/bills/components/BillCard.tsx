import React from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property, TaxRecord } from '@/lib/types';

interface BillCardProps {
  property: Property;
  taxes: TaxRecord[]; // Changed to array of all taxes
  index: number;
  onDownload: () => void;
}

/**
 * BillCard Component
 * Displays consolidated bill information for all taxes with download button
 */
export const BillCard: React.FC<BillCardProps> = ({ property, taxes, index, onDownload }) => {
  // Calculate totals across all taxes
  const totalAssessed = taxes.reduce((sum, tax) => sum + tax.assessedAmount, 0);
  const totalPaid = taxes.reduce((sum, tax) => sum + tax.amountPaid, 0);
  const totalDue = totalAssessed - totalPaid;
  
  // Determine overall payment status
  const overallStatus = totalPaid === 0 ? 'Unpaid' : totalPaid >= totalAssessed ? 'Paid' : 'Partial';
  
  return (
    <div
      className="card-premium p-6 hover:border-primary/20 transition-all animate-slide-up group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-col gap-6">
        {/* Header with Owner Name and Status */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-foreground tracking-tight">{property.ownerName}</h3>
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm",
              overallStatus === 'Paid' && 'bg-success-light text-success border border-success/20',
              overallStatus === 'Unpaid' && 'bg-destructive-light text-destructive border border-destructive/20',
              overallStatus === 'Partial' && 'bg-warning-light text-warning border border-warning/20'
            )}>
              {overallStatus}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {taxes.length} {taxes.length === 1 ? 'Tax' : 'Taxes'}
            </span>
          </div>
        </div>
        
        {/* Property Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">Property ID</p>
            <p className="font-semibold text-foreground">{property.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">Property Type</p>
            <p className="font-semibold text-foreground">{property.propertyType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">Address</p>
            <p className="font-semibold text-foreground">{property.address}</p>
          </div>
        </div>

        {/* Individual Tax Details */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Tax Breakdown:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {taxes.map((tax, idx) => (
              <div 
                key={tax.id || idx}
                className="bg-muted/30 rounded-lg p-3 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-foreground">{tax.taxType}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold",
                    tax.paymentStatus === 'Paid' && 'bg-success-light text-success',
                    tax.paymentStatus === 'Unpaid' && 'bg-destructive-light text-destructive',
                    tax.paymentStatus === 'Partial' && 'bg-warning-light text-warning'
                  )}>
                    {tax.paymentStatus}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="font-medium">{tax.assessmentYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assessed:</span>
                    <span className="font-medium">Rs. {tax.assessedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-medium text-success">Rs. {tax.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due:</span>
                    <span className="font-medium text-destructive">Rs. {(tax.assessedAmount - tax.amountPaid).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary and Download Button */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-border">
          <div className="flex-1 flex items-center gap-6 text-sm bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4">
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Total Assessed</span>
              <span className="font-bold text-foreground text-lg">
                Rs. {totalAssessed.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Total Paid</span>
              <span className="font-bold text-success text-lg">
                Rs. {totalPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Total Due</span>
              <span className="font-bold text-destructive text-lg">
                Rs. {totalDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Download Button - Premium Design */}
          <button
            onClick={onDownload}
            className="btn-success flex items-center gap-3 justify-center min-w-[220px] group-hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <Download className="w-5 h-5 flex-shrink-0 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="whitespace-nowrap text-base relative z-10 font-semibold">Download Complete Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
