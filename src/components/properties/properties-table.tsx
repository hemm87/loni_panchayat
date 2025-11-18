
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, FileDown } from 'lucide-react';
import { PropertyActions } from './property-actions';
import { SearchEmptyState } from '@/components/ui/empty-state';


interface PropertiesTableProps {
  data: Property[];
}

const getStatusForProperty = (property: Property) => {
  if (!property.taxes || property.taxes.length === 0) return <Badge variant="outline">No Taxes</Badge>;
  const hasUnpaid = property.taxes.some(t => t.paymentStatus === 'Unpaid');
  const hasPartial = property.taxes.some(t => t.paymentStatus === 'Partial');
  const allPaid = property.taxes.every(t => t.paymentStatus === 'Paid');

  if (allPaid) return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">All Paid</Badge>;
  if (hasUnpaid) return <Badge variant="destructive">Unpaid</Badge>;
  if (hasPartial) return <Badge variant="outline" className="border-yellow-400 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400">Partial</Badge>;
  return <Badge variant="outline">N/A</Badge>;
};

export function PropertiesTable({ data }: PropertiesTableProps) {
  const [filter, setFilter] = React.useState('');

  const filteredData = data.filter(
    property =>
      property.ownerName.toLowerCase().includes(filter.toLowerCase()) ||
      (property.id && property.id.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="w-full animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors" />
          <Input
            placeholder="Search by owner name or property ID..."
            value={filter}
            onChange={event => setFilter(event.target.value)}
            className="w-full pl-11"
          />
        </div>
        <Button 
          variant="outline" 
          size="lg"
          className="animate-slide-up hover:-translate-y-0.5"
          style={{ animationDelay: '100ms' }}
        >
          <FileDown className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
      <div className="card-premium overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-muted/30 transition-colors" style={{ background: 'linear-gradient(90deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--muted) / 0.15) 100%)' }}>
              <TableHead className="font-bold text-foreground uppercase tracking-wider text-xs h-14">Property ID</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wider text-xs">Owner Details</TableHead>
              <TableHead className="hidden md:table-cell font-bold text-foreground uppercase tracking-wider text-xs">Type</TableHead>
              <TableHead className="hidden lg:table-cell font-bold text-foreground uppercase tracking-wider text-xs">Area</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wider text-xs">Status</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wider text-xs text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((property, index) => (
                <TableRow 
                  key={property.id} 
                  className="hover:bg-primary/5 hover:shadow-sm transition-all duration-300 border-b border-border/30 last:border-b-0 group animate-slide-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <TableCell className="font-bold text-primary group-hover:scale-105 transition-transform inline-block py-4">
                    {property.id}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {property.ownerName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                        {property.mobileNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4">
                    <Badge 
                      variant="outline" 
                      className="font-semibold border-primary/30 text-primary bg-primary/5 shadow-sm"
                    >
                      {property.propertyType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-foreground font-bold py-4">
                    {property.area.toLocaleString()}
                    <span className="text-xs text-muted-foreground ml-1.5 font-normal">sq.ft</span>
                  </TableCell>
                  <TableCell className="py-4">{getStatusForProperty(property)}</TableCell>
                  <TableCell className="text-right py-4">
                    <PropertyActions property={property} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center"
                >
                  <SearchEmptyState onClear={() => setFilter('')} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    