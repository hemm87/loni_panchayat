
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
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors" />
          <Input
            placeholder="Search by owner name or property ID..."
            value={filter}
            onChange={event => setFilter(event.target.value)}
            className="w-full pl-11 h-12 border-2 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        <Button 
          variant="outline" 
          className="h-12 px-6 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <FileDown className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Export</span>
        </Button>
      </div>
      <div className="rounded-2xl border-2 border-border/50 overflow-hidden shadow-md hover:shadow-xl transition-all bg-card backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/50 hover:to-muted/30 border-b-2 border-border/50">
              <TableHead className="font-bold text-foreground uppercase tracking-wide h-14">Property ID</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wide">Owner</TableHead>
              <TableHead className="hidden md:table-cell font-bold text-foreground uppercase tracking-wide">Type</TableHead>
              <TableHead className="hidden lg:table-cell font-bold text-foreground uppercase tracking-wide">Area (sq. ft)</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wide">Tax Status</TableHead>
              <TableHead className="font-bold text-foreground uppercase tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((property, index) => (
                <TableRow 
                  key={property.id} 
                  className="hover:bg-primary/5 transition-all duration-300 border-b border-border/30 last:border-b-0 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-bold text-primary group-hover:text-primary/80 transition-colors">
                    {property.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {property.ownerName}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-success/60"></span>
                      {property.mobileNumber}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge 
                      variant="outline" 
                      className="font-medium border-primary/30 text-primary/80 bg-primary/5"
                    >
                      {property.propertyType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-foreground font-semibold">
                    {property.area.toLocaleString()}
                    <span className="text-xs text-muted-foreground ml-1">sq.ft</span>
                  </TableCell>
                  <TableCell>{getStatusForProperty(property)}</TableCell>
                  <TableCell className="text-right">
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

    