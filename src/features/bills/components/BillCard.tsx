import React from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property, TaxRecord } from '@/lib/types';

interface BillCardProps {
  property: Property;
  tax: TaxRecord;
  index: number;
  onDownload: () => void;
}

/**
 * BillCard Component
 * Displays individual bill information with download button
 */
export const BillCard: React.FC<BillCardProps> = ({ property, tax, index, onDownload }) => {
  
  return (
    <div
      className="card-premium p-6 hover:border-primary/20 transition-all animate-slide-up group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Bill Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-foreground tracking-tight">{property.ownerName}</h3>
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm",
              tax.paymentStatus === 'Paid' && 'bg-success-light text-success border border-success/20',
              tax.paymentStatus === 'Unpaid' && 'bg-destructive-light text-destructive border border-destructive/20',
              tax.paymentStatus === 'Partial' && 'bg-warning-light text-warning border border-warning/20'
            )}>
              {tax.paymentStatus}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Property ID</p>
              <p className="font-semibold text-foreground">{property.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Tax Type</p>
              <p className="font-semibold text-foreground">{tax.taxType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Receipt No.</p>
              <p className="font-semibold text-foreground">{tax.receiptNumber || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Assessment Year</p>
              <p className="font-semibold text-foreground">{tax.assessmentYear}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm bg-muted/30 rounded-xl p-4">
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Assessed</span>
              <span className="font-bold text-foreground text-base">
                ₹{tax.assessedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Paid</span>
              <span className="font-bold text-success text-base">
                ₹{tax.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Due</span>
              <span className="font-bold text-destructive text-base">
                ₹{(tax.assessedAmount - tax.amountPaid).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button - Premium Design */}
        <button
          onClick={onDownload}
          className="btn-success flex items-center gap-3 justify-center min-w-[200px] group-hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          <Download className="w-5 h-5 flex-shrink-0 relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="whitespace-nowrap text-base relative z-10 font-semibold">Download PDF</span>
        </button>
      </div>
    </div>
  );
};
