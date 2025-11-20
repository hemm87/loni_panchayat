/**
 * Custom hook for managing bills data, filtering, and download functionality
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Property, PanchayatSettings, TaxRecord } from '@/lib/types';
import { generateBillPdf } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/use-toast';

export interface BillData {
  property: Property;
  taxes: TaxRecord[]; // Changed to array of all taxes
}

export type PaymentStatusFilter = 'All' | 'Paid' | 'Unpaid' | 'Partial';

/**
 * Manages bills data with filtering, sorting, and download functionality
 */
export function useBillsData(
  properties: Property[],
  settings: PanchayatSettings | null
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatusFilter>('All');
  const { toast } = useToast();

  // Generate all bills from properties with tax records
  // Each bill contains ALL taxes for a property (consolidated)
  const allBills = useMemo(() => {
    const bills: BillData[] = [];
    properties.forEach((property) => {
      if (property.taxes && property.taxes.length > 0) {
        bills.push({ property, taxes: property.taxes });
      }
    });
    return bills;
  }, [properties]);

  // Filter bills based on search and status
  const filteredBills = useMemo(() => {
    return allBills.filter((bill) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          bill.property.ownerName.toLowerCase().includes(searchLower) ||
          bill.property.id.toLowerCase().includes(searchLower) ||
          bill.property.address.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus !== 'All') {
        // Check if ANY tax matches the filter status
        const hasMatchingStatus = bill.taxes.some(
          (tax) => tax.paymentStatus === filterStatus
        );
        if (!hasMatchingStatus) return false;
      }

      return true;
    });
  }, [allBills, searchTerm, filterStatus]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        acc.totalBills++;
        // Sum all taxes for each property
        bill.taxes.forEach((tax) => {
          acc.totalAssessed += tax.assessedAmount;
          acc.totalCollected += tax.amountPaid;
          acc.totalPending += tax.assessedAmount - tax.amountPaid;
        });
        return acc;
      },
      {
        totalBills: 0,
        totalAssessed: 0,
        totalCollected: 0,
        totalPending: 0,
      }
    );
  }, [filteredBills]);

  // Handle bill download - now downloads ALL taxes for a property
  const handleDownloadBill = useCallback(
    async (property: Property, taxes: TaxRecord[]) => {
      try {
        if (!settings) {
          toast({
            title: 'Error',
            description: 'Panchayat settings not loaded. Please refresh the page.',
            variant: 'destructive',
          });
          return;
        }

        // Show loading toast
        toast({
          title: 'Generating PDF...',
          description: 'Please wait while we generate your consolidated bill',
        });

        // Generate PDF with ALL taxes
        await generateBillPdf(property, taxes, settings);

        toast({
          title: 'Success!',
          description: `Consolidated tax receipt for ${property.ownerName} downloaded successfully`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to download bill. Please try again.';
        toast({
          title: 'Download Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [settings, toast]
  );

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    allBills,
    filteredBills,
    summary,
    handleDownloadBill,
  };
}
