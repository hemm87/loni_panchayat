import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'All' | 'Paid' | 'Unpaid' | 'Partial';
  onFilterChange: (status: 'All' | 'Paid' | 'Unpaid' | 'Partial') => void;
}

/**
 * BillFilters Component
 * Displays search input and status filter buttons for bills
 */
export const BillFilters: React.FC<BillFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) => {
  const statusOptions: Array<'All' | 'Paid' | 'Unpaid' | 'Partial'> = [
    'All', 
    'Paid', 
    'Unpaid', 
    'Partial'
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by owner name, property ID, or receipt number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-11 pr-4 border-2 rounded-xl shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all",
                filterStatus === status
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
