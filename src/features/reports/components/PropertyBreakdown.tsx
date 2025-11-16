/**
 * Property Breakdown Component
 * 
 * Displays property distribution by type:
 * - Residential
 * - Commercial
 * - Agricultural
 * 
 * Shows count and percentage for each type
 */

'use client';

import { Home } from 'lucide-react';

interface PropertyBreakdownProps {
  propertyTypeBreakdown: Record<string, number>;
  totalProperties: number;
}

/**
 * Property type distribution
 */
export function PropertyBreakdown({ propertyTypeBreakdown, totalProperties }: PropertyBreakdownProps) {
  return (
    <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
      <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Home className="w-6 h-6 text-accent" />
        </div>
        Property Distribution • संपत्ति वितरण
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(propertyTypeBreakdown).map(([type, count], index) => (
          <div 
            key={type} 
            className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-border/50 hover:shadow-md transition-all animate-scale-in" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-4xl mb-2">
              {type === 'Residential' ? '🏠' : type === 'Commercial' ? '🏢' : '🌾'}
            </div>
            <p className="text-3xl font-headline font-bold text-primary mb-1">{count}</p>
            <p className="text-sm font-semibold text-foreground">{type}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((count / totalProperties) * 100).toFixed(1)}% of total
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
