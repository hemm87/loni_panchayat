
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
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by owner or property ID..."
            value={filter}
            onChange={event => setFilter(event.target.value)}
            className="w-full pl-10 h-11 border-2 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="h-11 px-5 border-2 hover:bg-primary/5 hover:border-primary/50">
          <FileDown className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
      <div className="rounded-xl border-2 border-border/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">Property ID</TableHead>
              <TableHead className="font-semibold text-foreground">Owner</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-foreground">Type</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold text-foreground">Area (sq. ft)</TableHead>
              <TableHead className="font-semibold text-foreground">Tax Status</TableHead>
              <TableHead className="font-semibold text-foreground">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((property, index) => (
                <TableRow key={property.id} className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}>
                  <TableCell className="font-semibold text-foreground">{property.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{property.ownerName}</div>
                    <div className="text-xs text-muted-foreground mt-1">{property.mobileNumber}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {property.propertyType}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground font-medium">
                    {property.area.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusForProperty(property)}</TableCell>
                  <TableCell>
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

    