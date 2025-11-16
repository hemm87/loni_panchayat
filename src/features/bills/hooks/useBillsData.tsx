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
  tax: TaxRecord;
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
  const allBills = useMemo(() => {
    const bills: BillData[] = [];
    properties.forEach((property) => {
      if (property.taxes && property.taxes.length > 0) {
        property.taxes.forEach((tax) => {
          bills.push({ property, tax });
        });
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
        if (bill.tax.paymentStatus !== filterStatus) return false;
      }

      return true;
    });
  }, [allBills, searchTerm, filterStatus]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        acc.totalBills++;
        acc.totalAssessed += bill.tax.assessedAmount;
        acc.totalCollected += bill.tax.amountPaid;
        acc.totalPending += bill.tax.assessedAmount - bill.tax.amountPaid;
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

  // Handle bill download
  const handleDownloadBill = useCallback(
    async (property: Property, tax: TaxRecord) => {
      try {
        if (!settings) {
          toast({
            title: 'Error',
            description: 'Panchayat settings not loaded',
            variant: 'destructive',
          });
          return;
        }

        await generateBillPdf(property, [tax], settings);

        toast({
          title: 'Success',
          description: `Bill for ${property.ownerName} downloaded successfully`,
        });
      } catch (error) {
        console.error('Error downloading bill:', error);
        toast({
          title: 'Error',
          description: 'Failed to download bill. Please try again.',
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
