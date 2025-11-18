/**
 * Bills List Page - Main Container Component
 * 
 * Displays all generated bills with filtering, search, and download functionality.
 * Uses presentational components for UI and custom hook for data management.
 */

'use client';

import { useBillsData } from '../hooks/useBillsData';
import { BillFilters } from './BillFilters';
import { BillCard } from './BillCard';
import { BillsSummary } from './BillsSummary';
import { FileText, Download } from 'lucide-react';
import type { Property, PanchayatSettings } from '@/lib/types';

interface BillsListPageProps {
  properties: Property[];
  settings: PanchayatSettings | null;
}

/**
 * Main bills list page component
 */
export function BillsListPage({ properties, settings }: BillsListPageProps) {
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredBills,
    handleDownloadBill,
  } = useBillsData(properties, settings);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-elevated p-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--success-hover)) 100%)' }}>
            <Download className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Download Bills
            </h2>
            <p className="text-base text-muted-foreground mt-1.5 font-hindi">बिल डाउनलोड करें</p>
          </div>
        </div>

        {/* Filters */}
        <BillFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="card-premium rounded-2xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Bills Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== 'All'
              ? 'Try adjusting your search or filter criteria'
              : 'No bills have been generated yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredBills.map(({ property, tax }, index) => (
              <BillCard
                key={`${property.id}-${tax.id}`}
                property={property}
                tax={tax}
                onDownload={() => handleDownloadBill(property, tax)}
                index={index}
              />
            ))}
          </div>

          {/* Summary Stats */}
          <BillsSummary bills={filteredBills} />
        </>
      )}
    </div>
  );
}
