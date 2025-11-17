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
      className="card-premium rounded-xl p-6 border-2 border-border/50 hover:border-primary/30 hover:shadow-lg transition-all animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Bill Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-foreground">{property.ownerName}</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              tax.paymentStatus === 'Paid' && 'bg-success/10 text-success',
              tax.paymentStatus === 'Unpaid' && 'bg-destructive/10 text-destructive',
              tax.paymentStatus === 'Partial' && 'bg-warning/10 text-warning'
            )}>
              {tax.paymentStatus}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Property ID</p>
              <p className="font-semibold">{property.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tax Type</p>
              <p className="font-semibold">{tax.taxType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Receipt No.</p>
              <p className="font-semibold">{tax.receiptNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assessment Year</p>
              <p className="font-semibold">{tax.assessmentYear}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Assessed: </span>
              <span className="font-bold text-foreground">
                ₹{tax.assessedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Paid: </span>
              <span className="font-bold text-success">
                ₹{tax.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Due: </span>
              <span className="font-bold text-destructive">
                ₹{(tax.assessedAmount - tax.amountPaid).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button - Highly Visible */}
        <button
          onClick={onDownload}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 flex items-center gap-3 justify-center min-w-[200px] border-2 border-blue-400 ring-2 ring-blue-300/50"
        >
          <Download className="w-6 h-6 flex-shrink-0 animate-pulse" />
          <span className="whitespace-nowrap text-lg">Download PDF</span>
        </button>
      </div>
    </div>
  );
};
