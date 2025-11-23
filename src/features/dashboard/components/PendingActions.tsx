import React from 'react';
import { AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/lib/types';

interface PendingActionsProps {
  properties: Property[];
  onBillClick: () => void;
}

/**
 * PendingActions Component
 * Displays properties with pending payments requiring attention
 */
export const PendingActions: React.FC<PendingActionsProps> = ({ properties, onBillClick }) => {
  const getPendingAmount = (property: Property): number => {
    return property.taxes
      ?.filter(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial')
      .reduce((sum, t) => sum + (t.assessedAmount - t.amountPaid), 0) || 0;
  };

  const getPendingYears = (property: Property): string => {
    const years = property.taxes
      ?.filter(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial')
      .map(t => t.assessmentYear)
      .sort() || [];
    
    if (years.length === 0) return '';
    if (years.length === 1) return `FY ${years[0]}-${(years[0] + 1).toString().slice(-2)}`;
    if (years.length === 2) return `FY ${years[0]}-${(years[0] + 1).toString().slice(-2)}, ${years[1]}-${(years[1] + 1).toString().slice(-2)}`;
    return `FY ${years[0]}-${(years[0] + 1).toString().slice(-2)}, ${years[1]}-${(years[1] + 1).toString().slice(-2)} +${years.length - 2}`;
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up"
      style={{ animationDelay: '300ms' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-headline font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <span>
            Pending Payments <span className="text-muted-foreground/60">•</span>{' '}
            <span className="font-hindi text-muted-foreground">लंबित भुगतान</span>
          </span>
        </h3>
        {properties.length > 5 && (
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            +{properties.length - 5} more
          </span>
        )}
      </div>

      <div className="space-y-3">
        {properties.length > 0 ? (
          properties.map((property) => {
            const pendingAmount = getPendingAmount(property);
            const pendingYears = getPendingYears(property);
            
            return (
              <div
                key={property.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                  "hover:bg-muted/50 border border-transparent hover:border-orange-500/30",
                  "group cursor-pointer"
                )}
                onClick={onBillClick}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {property.ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Property: {property.houseNo}
                      </p>
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {pendingYears}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-orange-600">
                        ₹{pendingAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">Due</p>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No pending payments</p>
            <p className="text-xs text-muted-foreground/60">All properties are up to date</p>
          </div>
        )}
      </div>

      {properties.length > 0 && (
        <button
          onClick={onBillClick}
          className="mt-4 w-full py-2 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 rounded-lg text-sm font-medium transition-colors border border-orange-500/20 hover:border-orange-500/40"
        >
          Generate Bills
        </button>
      )}
    </div>
  );
};
