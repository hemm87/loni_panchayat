
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, DollarSign, Eye } from 'lucide-react';
import type { Property, TaxRecord } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PropertyActionsProps {
  property: Property;
}

export function PropertyActions({ property }: PropertyActionsProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [isViewTaxesDialogOpen, setIsViewTaxesDialogOpen] = React.useState(false);

  const [editedProperty, setEditedProperty] = React.useState<Property>(property);
  const [paymentAmounts, setPaymentAmounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    // When a new property is selected, reset the payment amounts and edited state
    setEditedProperty(property);
    setPaymentAmounts({});
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedProperty(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: 'Residential' | 'Commercial' | 'Agricultural') => {
    setEditedProperty(prev => ({ ...prev, propertyType: value }));
  };

  const handleUpdate = async () => {
    if (!firestore) return;
    try {
      const propertyRef = doc(firestore, 'properties', property.id);
      const updateData = {
          ...editedProperty,
          area: Number(editedProperty.area), // Ensure area is a number
      };
      // Firestore does not like the `id` field to be in the data
      delete (updateData as Partial<Property>).id;

      await updateDoc(propertyRef, updateData);
      toast({ title: 'Success', description: 'Property updated successfully.' });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async () => {
    if (!firestore) return;
    try {
      const propertyRef = doc(firestore, 'properties', property.id);
      await deleteDoc(propertyRef);
      toast({ title: 'Success', description: 'Property deleted successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handlePaymentAmountChange = (taxId: string, amount: string) => {
    setPaymentAmounts(prev => ({
        ...prev,
        [taxId]: parseFloat(amount) || 0,
    }))
  }

  const handleRecordPayment = async () => {
    if (!firestore) return;

    const updatedTaxes = property.taxes.map(tax => {
        const paymentAmount = paymentAmounts[tax.id] || 0;
        if (paymentAmount > 0) {
            const newAmountPaid = tax.amountPaid + paymentAmount;
            const isPaid = newAmountPaid >= tax.assessedAmount;
            
            return {
                ...tax,
                amountPaid: newAmountPaid,
                paymentStatus: isPaid ? 'Paid' : 'Partial' as 'Paid' | 'Partial',
                paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                receiptNumber: `REC-${Date.now()}`
            };
        }
        return tax;
    });

    try {
        const propertyRef = doc(firestore, 'properties', property.id);
        await updateDoc(propertyRef, { taxes: updatedTaxes });
        toast({ title: "Success", description: "Payments recorded successfully."});
        setIsPaymentDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    }
  }


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsViewTaxesDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Taxes</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsPaymentDialogOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Record Payment</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Property</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-red-600">
             <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Property</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Taxes Dialog */}
      <Dialog open={isViewTaxesDialogOpen} onOpenChange={setIsViewTaxesDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tax Details for {property.ownerName}</DialogTitle>
            <DialogDescription>
                A complete record of all taxes associated with property ID: {property.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {property.taxes?.length > 0 ? (
                <div className="border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="p-3 text-left font-semibold">Tax / Year</th>
                                <th className="p-3 text-left font-semibold">Status</th>
                                <th className="p-3 text-right font-semibold">Assessed</th>
                                <th className="p-3 text-right font-semibold">Paid</th>
                                <th className="p-3 text-right font-semibold">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                        {property.taxes.map(tax => {
                            const due = tax.assessedAmount - tax.amountPaid;
                            return (
                            <tr key={tax.id} className="border-b last:border-b-0">
                                <td className="p-3">
                                    <p className="font-medium">{tax.taxType}</p>
                                    <p className="text-xs text-muted-foreground">{tax.assessmentYear}</p>
                                </td>
                                <td className="p-3">
                                    {tax.paymentStatus === 'Paid' ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
                                    ) : tax.paymentStatus === 'Partial' ? (
                                        <Badge variant="outline" className="border-yellow-400 text-yellow-600">Partial</Badge>
                                    ) : (
                                        <Badge variant="destructive">Unpaid</Badge>
                                    )}
                                </td>
                                <td className="p-3 text-right font-mono">₹{tax.assessedAmount.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right font-mono">₹{tax.amountPaid.toLocaleString('en-IN')}</td>
                                <td className={`p-3 text-right font-mono font-semibold ${due > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                    ₹{due.toLocaleString('en-IN')}
                                </td>
                            </tr>
                            )
                        })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted/50 font-bold">
                                <td colSpan={2} className="p-3 text-right">Total</td>
                                <td className="p-3 text-right font-mono">₹{property.taxes.reduce((acc, t) => acc + t.assessedAmount, 0).toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right font-mono">₹{property.taxes.reduce((acc, t) => acc + t.amountPaid, 0).toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right font-mono">₹{property.taxes.reduce((acc, t) => acc + (t.assessedAmount - t.amountPaid), 0).toLocaleString('en-IN')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No taxes associated with this property.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Property: {property.id}</DialogTitle>
            <DialogDescription>
              Make changes to the property details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input id="ownerName" value={editedProperty.ownerName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input id="fatherName" value={editedProperty.fatherName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input id="mobileNumber" type="tel" value={editedProperty.mobileNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="houseNo">House No.</Label>
                    <Input id="houseNo" value={editedProperty.houseNo} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={editedProperty.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={editedProperty.propertyType} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Residential">Residential</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Agricultural">Agricultural</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="area">Area (sq. ft.)</Label>
                    <Input id="area" type="number" value={editedProperty.area} onChange={handleInputChange} />
                </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Record Payment for {property.ownerName}</DialogTitle>
                <DialogDescription>
                    Enter the amount being paid for each tax. The status will be updated automatically.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {property.taxes?.filter(t => t.paymentStatus !== 'Paid').length > 0 ? property.taxes.filter(t => t.paymentStatus !== 'Paid').map(tax => {
                    const due = tax.assessedAmount - tax.amountPaid;
                    return (
                        <div key={tax.id} className="grid grid-cols-5 items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="col-span-2">
                                <p className="font-semibold">{tax.taxType} <span className="text-xs">({tax.assessmentYear})</span></p>
                                <p className="text-sm text-muted-foreground">Due: ₹{due.toLocaleString()}</p>
                            </div>
                            <div>
                                {tax.paymentStatus === 'Partial' ? (
                                     <Badge variant="outline" className="border-yellow-400 text-yellow-600">Partial</Badge>
                                ) : (
                                    <Badge variant="destructive">Unpaid</Badge>
                                )}
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor={`payment-${tax.id}`} className="sr-only">Payment Amount</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                    <Input 
                                        id={`payment-${tax.id}`}
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-7"
                                        value={paymentAmounts[tax.id] || ''}
                                        onChange={e => handlePaymentAmountChange(tax.id, e.target.value)}
                                        max={due}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <p className="text-center text-muted-foreground py-8">All taxes for this property are paid.</p>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleRecordPayment} disabled={Object.values(paymentAmounts).every(v => v === 0)}>
                    <span className="mr-2">₹</span>
                    Save Payments
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the property
                record for <span className="font-bold">{property.ownerName}</span> (ID: {property.id}) and all associated tax data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, delete it
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    