'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Phone,
  Calendar,
  Receipt,
  IndianRupee,
  ArrowRight,
  Filter,
  Building2,
  Banknote,
  CheckCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Property, TaxRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RecordPaymentPageProps {
  properties: Property[];
}

export function RecordPaymentPage({ properties }: RecordPaymentPageProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { firestore } = initializeFirebase();

  // Filter properties with pending taxes
  const propertiesWithPending = useMemo(() => {
    return properties.filter(p => 
      p.taxes?.some(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial')
    );
  }, [properties]);

  // Apply search and status filters
  const filteredProperties = useMemo(() => {
    return propertiesWithPending.filter(property => {
      const matchesSearch = 
        property.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.mobileNumber?.includes(searchQuery) ||
        property.houseNo?.toLowerCase().includes(searchQuery.toLowerCase());

      const hasUnpaid = property.taxes?.some(t => t.paymentStatus === 'Unpaid');
      const hasPartial = property.taxes?.some(t => t.paymentStatus === 'Partial');

      if (statusFilter === 'unpaid') return matchesSearch && hasUnpaid;
      if (statusFilter === 'partial') return matchesSearch && hasPartial;
      return matchesSearch;
    });
  }, [propertiesWithPending, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalPending = 0;
    let unpaidCount = 0;
    let partialCount = 0;

    propertiesWithPending.forEach(property => {
      property.taxes?.forEach(tax => {
        if (tax.paymentStatus === 'Unpaid') {
          totalPending += tax.assessedAmount - tax.amountPaid;
          unpaidCount++;
        } else if (tax.paymentStatus === 'Partial') {
          totalPending += tax.assessedAmount - tax.amountPaid;
          partialCount++;
        }
      });
    });

    return {
      totalPending,
      unpaidCount,
      partialCount,
      totalProperties: propertiesWithPending.length
    };
  }, [propertiesWithPending]);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setPaymentAmounts({});
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentAmountChange = (taxId: string, amount: string) => {
    setPaymentAmounts(prev => ({
      ...prev,
      [taxId]: parseFloat(amount) || 0,
    }));
  };

  const getTotalPaymentAmount = () => {
    return Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const handleRecordPayment = async () => {
    if (!firestore || !selectedProperty) return;

    const totalPayment = getTotalPaymentAmount();
    if (totalPayment <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid payment amount.' });
      return;
    }

    setIsProcessing(true);

    const updatedTaxes = selectedProperty.taxes.map(tax => {
      const paymentAmount = paymentAmounts[tax.id] || 0;
      if (paymentAmount > 0) {
        const newAmountPaid = tax.amountPaid + paymentAmount;
        const isPaid = newAmountPaid >= tax.assessedAmount;
        
        return {
          ...tax,
          amountPaid: newAmountPaid,
          paymentStatus: isPaid ? 'Paid' : 'Partial' as 'Paid' | 'Partial',
          paymentDate: new Date().toISOString().split('T')[0],
          receiptNumber: `REC-${Date.now()}`
        };
      }
      return tax;
    });

    try {
      const propertyRef = doc(firestore, 'properties', selectedProperty.id);
      await updateDoc(propertyRef, { taxes: updatedTaxes });
      
      toast({ 
        title: "Payment Recorded Successfully!", 
        description: `Rs. ${totalPayment.toLocaleString('en-IN')} recorded for ${selectedProperty.ownerName}`
      });
      
      setIsPaymentDialogOpen(false);
      setSelectedProperty(null);
      setPaymentAmounts({});
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPropertyPendingAmount = (property: Property) => {
    return property.taxes?.reduce((sum, tax) => {
      if (tax.paymentStatus !== 'Paid') {
        return sum + (tax.assessedAmount - tax.amountPaid);
      }
      return sum;
    }, 0) || 0;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            Record Payment
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span>भुगतान दर्ज करें</span>
            <span className="text-xs">•</span>
            <span>Manage and record tax payments</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-2 border-orange-300 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ea580c' }}>Properties</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#9a3412' }}>{stats.totalProperties}</p>
          <p className="text-xs mt-1" style={{ color: '#c2410c' }}>With pending dues</p>
        </Card>

        <Card className="p-5 border-2 border-red-300 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#dc2626' }}>Unpaid</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#991b1b' }}>{stats.unpaidCount}</p>
          <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Tax records unpaid</p>
        </Card>

        <Card className="p-5 border-2 border-yellow-300 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#eab308' }}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ca8a04' }}>Partial</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#854d0e' }}>{stats.partialCount}</p>
          <p className="text-xs mt-1" style={{ color: '#a16207' }}>Partially paid</p>
        </Card>

        <Card className="p-5 border-2 border-emerald-300 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#059669' }}>Pending</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#065f46' }}>
            Rs. {stats.totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-1" style={{ color: '#047857' }}>Total amount due</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, property ID, mobile, or house number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-2 focus:border-primary"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: 'all' | 'unpaid' | 'partial') => setStatusFilter(v)}>
          <SelectTrigger className="w-full md:w-48 h-12 border-2">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pending</SelectItem>
            <SelectItem value="unpaid">Unpaid Only</SelectItem>
            <SelectItem value="partial">Partial Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCheck className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No properties match your search criteria.'
                : 'No pending payments found. All taxes are paid!'}
            </p>
          </Card>
        ) : (
          filteredProperties.map((property, index) => {
            const pendingAmount = getPropertyPendingAmount(property);
            const unpaidTaxes = property.taxes?.filter(t => t.paymentStatus !== 'Paid') || [];

            return (
              <Card 
                key={property.id}
                className={cn(
                  "p-5 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50",
                  "animate-slide-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleSelectProperty(property)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Owner Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {property.ownerName}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{property.mobileNumber}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {property.houseNo || property.id} • {property.propertyType}
                      </p>
                    </div>
                  </div>

                  {/* Tax Badges */}
                  <div className="flex flex-wrap gap-1.5 lg:flex-1">
                    {unpaidTaxes.slice(0, 2).map((tax, idx) => (
                      <Badge 
                        key={idx}
                        variant={tax.paymentStatus === 'Unpaid' ? 'destructive' : 'outline'}
                        className={cn(
                          "text-xs",
                          tax.paymentStatus === 'Partial' && "border-yellow-400 text-yellow-600 bg-yellow-50"
                        )}
                      >
                        {tax.taxType} ({tax.assessmentYear})
                      </Badge>
                    ))}
                    {unpaidTaxes.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unpaidTaxes.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Amount and Pay Button */}
                  <div className="flex items-center justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-muted-foreground">Pending Amount</p>
                      <p className="text-xl font-bold text-destructive">
                        Rs. {pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Button 
                      size="default" 
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md min-w-[120px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProperty(property);
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Record (भुगतान दर्ज करें)
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-success" />
              </div>
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Enter payment amounts for {selectedProperty?.ownerName}'s pending taxes
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6 py-4">
              {/* Property Summary */}
              <div className="p-4 bg-muted/50 rounded-xl border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-semibold ml-2">{selectedProperty.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-semibold ml-2">{selectedProperty.houseNo || selectedProperty.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-semibold ml-2">{selectedProperty.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-semibold ml-2">{selectedProperty.propertyType}</span>
                  </div>
                </div>
              </div>

              {/* Pending Taxes */}
              <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Pending Tax Records
                </h4>
                
                {selectedProperty.taxes?.filter(t => t.paymentStatus !== 'Paid').map((tax) => {
                  const due = tax.assessedAmount - tax.amountPaid;
                  const paymentAmount = paymentAmounts[tax.id] || 0;
                  const remainingAfterPayment = due - paymentAmount;

                  return (
                    <div 
                      key={tax.id} 
                      className="p-4 bg-background rounded-xl border-2 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={tax.paymentStatus === 'Unpaid' ? 'destructive' : 'outline'}
                              className={cn(
                                tax.paymentStatus === 'Partial' && "border-yellow-400 text-yellow-600"
                              )}
                            >
                              {tax.paymentStatus}
                            </Badge>
                            <span className="font-bold">{tax.taxType}</span>
                            <span className="text-muted-foreground">({tax.assessmentYear})</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground block">Assessed</span>
                              <span className="font-semibold">Rs. {tax.assessedAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Paid</span>
                              <span className="font-semibold text-success">Rs. {tax.amountPaid.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Due</span>
                              <span className="font-semibold text-destructive">Rs. {due.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-48">
                          <Label htmlFor={`payment-${tax.id}`} className="text-xs text-muted-foreground mb-1 block">
                            Payment Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-bold">
                              Rs.
                            </span>
                            <Input
                              id={`payment-${tax.id}`}
                              type="number"
                              placeholder="0.00"
                              className="pl-10 h-12 text-lg font-bold border-2"
                              value={paymentAmounts[tax.id] || ''}
                              onChange={e => handlePaymentAmountChange(tax.id, e.target.value)}
                              max={due}
                              min="0"
                            />
                          </div>
                          {paymentAmount > 0 && (
                            <p className={cn(
                              "text-xs mt-1",
                              remainingAfterPayment <= 0 ? "text-success" : "text-muted-foreground"
                            )}>
                              {remainingAfterPayment <= 0 
                                ? "✓ Will be fully paid" 
                                : `Rs. ${remainingAfterPayment.toLocaleString('en-IN')} remaining`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              {getTotalPaymentAmount() > 0 && (
                <div className="p-4 bg-gradient-to-r from-success/10 to-emerald-500/10 rounded-xl border-2 border-success/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Total Payment</span>
                    <span className="text-3xl font-bold text-success">
                      Rs. {getTotalPaymentAmount().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isProcessing}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleRecordPayment}
              disabled={isProcessing || getTotalPaymentAmount() <= 0}
              className="bg-success hover:bg-success/90 gap-2"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
