/**
 * Tax Breakdown Component
 * 
 * Displays tax collection breakdown by tax type with:
 * - Tax type name
 * - Number of records
 * - Total, Collected, and Pending amounts
 */

'use client';

import { FileText } from 'lucide-react';

interface TaxBreakdownProps {
  taxesByType: Record<string, { total: number; paid: number; pending: number; count: number }>;
}

/**
 * Tax breakdown by type
 */
export function TaxBreakdown({ taxesByType }: TaxBreakdownProps) {
  return (
    <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
      <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        Tax Breakdown by Type • कर प्रकार के अनुसार विवरण
      </h3>
      <div className="space-y-4">
        {Object.entries(taxesByType).map(([type, data], index) => (
          <div 
            key={type} 
            className="p-4 bg-muted/20 rounded-xl border border-border/50 hover:shadow-md transition-all animate-fade-in" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground">{type}</h4>
              <span className="badge-info">{data.count} records</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Total</p>
                <p className="font-bold text-foreground">Rs. {data.total.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Collected</p>
                <p className="font-bold text-success">Rs. {data.paid.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Pending</p>
                <p className="font-bold text-warning">Rs. {data.pending.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
