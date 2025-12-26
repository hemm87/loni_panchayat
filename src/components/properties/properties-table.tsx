
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
import { Card } from '../ui/card';
import { Search, FileDown, Phone, MapPin, Home, User, Calendar } from 'lucide-react';
import { PropertyActions } from './property-actions';
import { SearchEmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';


interface PropertiesTableProps {
  data: Property[];
}

const getStatusForProperty = (property: Property) => {
  if (!property.taxes || property.taxes.length === 0) return <Badge variant="outline" className="text-xs">No Taxes</Badge>;
  const hasUnpaid = property.taxes.some(t => t.paymentStatus === 'Unpaid');
  const hasPartial = property.taxes.some(t => t.paymentStatus === 'Partial');
  const allPaid = property.taxes.every(t => t.paymentStatus === 'Paid');

  if (allPaid) return <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs shadow-sm">✓ Paid</Badge>;
  if (hasUnpaid) return <Badge variant="destructive" className="text-xs shadow-sm">Unpaid</Badge>;
  if (hasPartial) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs shadow-sm">Partial</Badge>;
  return <Badge variant="outline" className="text-xs">N/A</Badge>;
};

const getPendingAmount = (property: Property) => {
  return property.taxes?.reduce((sum, tax) => {
    return sum + (tax.assessedAmount - tax.amountPaid);
  }, 0) || 0;
};

export function PropertiesTable({ data }: PropertiesTableProps) {
  const [filter, setFilter] = React.useState('');

  const filteredData = data.filter(
    property =>
      property.ownerName.toLowerCase().includes(filter.toLowerCase()) ||
      (property.id && property.id.toLowerCase().includes(filter.toLowerCase())) ||
      (property.mobileNumber && property.mobileNumber.includes(filter)) ||
      (property.houseNo && property.houseNo.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="w-full animate-fade-in space-y-5">
      {/* Search and Filter Bar */}
      <Card className="p-4 border-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, property ID, mobile, or house no..."
              value={filter}
              onChange={event => setFilter(event.target.value)}
              className="w-full pl-12 h-12 text-base border-2 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-sm text-muted-foreground hidden md:block">
              Showing <span className="font-bold text-foreground">{filteredData.length}</span> of {data.length}
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 border-2 hover:border-primary/50 h-12"
            >
              <FileDown className="h-5 w-5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Table Container */}
      <Card className="overflow-hidden border-2 shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider h-14 pl-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner Details
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Property
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell font-bold text-foreground text-xs uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="hidden lg:table-cell font-bold text-foreground text-xs uppercase tracking-wider text-right">
                  Pending
                </TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">
                  Status
                </TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length ? (
                filteredData.map((property, index) => {
                  const pendingAmount = getPendingAmount(property);
                  return (
                    <TableRow 
                      key={property.id} 
                      className={cn(
                        "hover:bg-primary/5 transition-all duration-200 border-b group",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      {/* Owner Details */}
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {property.ownerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {property.ownerName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 md:hidden">
                              <Phone className="w-3 h-3" />
                              {property.mobileNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Property Details */}
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{property.houseNo || property.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {property.propertyType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {property.area?.toLocaleString()} sq.ft
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="hidden md:table-cell py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">{property.mobileNumber}</span>
                        </div>
                      </TableCell>

                      {/* Pending Amount */}
                      <TableCell className="hidden lg:table-cell py-4 text-right">
                        <span className={cn(
                          "font-bold text-base",
                          pendingAmount > 0 ? "text-destructive" : "text-success"
                        )}>
                          {pendingAmount > 0 ? `Rs. ${pendingAmount.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 text-center">
                        {getStatusForProperty(property)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 text-right pr-6">
                        <PropertyActions property={property} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <SearchEmptyState onClear={() => setFilter('')} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Table Footer */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredData.length}</span> properties
            </p>
            <p className="text-sm text-muted-foreground">
              Total Pending: <span className="font-bold text-destructive">
                Rs. {filteredData.reduce((sum, p) => sum + getPendingAmount(p), 0).toLocaleString('en-IN')}
              </span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

    