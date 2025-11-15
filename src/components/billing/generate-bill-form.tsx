
'use client';
import { useState, useMemo } from 'react';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Printer, PlusCircle, Trash2 } from 'lucide-react'; // Added PlusCircle and Trash2
import type { Property, PanchayatSettings } from '@/lib/types';
import { getTaxHindiName } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// New type for the manual tax rates input
interface ManualTax {
    name: string;
    rate: number; // Percentage
}

interface GenerateBillFormProps {
    properties: Property[];
    settings: PanchayatSettings | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

// Import the actual PDF generator
import { generateBillPdf as generatePdfFile } from '@/lib/pdf-generator';

// Generate receipt number
const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP${year}${month}${random}`;
};


export function GenerateBillForm({ properties, settings, onFormSubmit, onCancel }: GenerateBillFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [billGenerated, setBillGenerated] = useState(false);

    const [billData, setBillData] = useState({
        propertyId: '',
        taxType: 'Property Tax' as Property['taxes'][number]['taxType'],
        date: new Date().toISOString().split('T')[0],
        remarks: '',
        customBaseAmount: 0,
    });
    
    // NEW STATE for manual tax rates
    const [manualTaxes, setManualTaxes] = useState<ManualTax[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBillData(prev => ({ ...prev, [name]: value }));
        setBillGenerated(false);
    };

    const handleSelectChange = (name: string, value: string) => {
        setBillData(prev => ({ ...prev, [name]: value }));
        setBillGenerated(false);
    };

    const handleManualTaxChange = (index: number, name: 'name' | 'rate', value: string) => {
        setManualTaxes(prev => prev.map((tax, i) => 
            i === index ? { ...tax, [name]: name === 'rate' ? Number(value) : value } : tax
        ));
        setBillGenerated(false);
    };

    const addManualTax = () => {
        setManualTaxes(prev => [...prev, { name: '', rate: 0 }]);
    };

    const removeManualTax = (index: number) => {
        setManualTaxes(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectedProperty = useMemo(() => {
        return properties.find(p => p.id === billData.propertyId);
    }, [properties, billData.propertyId]); 


    // --- CALCULATION LOGIC ---
    const baseAmount = useMemo(() => {
        if (!selectedProperty || !settings) return 0;
        
        switch (billData.taxType) {
            case 'Property Tax':
                // Base amount = (property area × tax rate per sq.ft)
                return (settings.propertyTaxRate / 100) * selectedProperty.area;
            case 'Water Tax':
                // Flat rate from settings
                return settings.waterTaxRate || 0;
            case 'Sanitation Tax':
                // Flat rate - can be configured in settings
                return 500;
            case 'Lighting Tax':
                // Flat rate - can be configured in settings
                return 300;
            case 'Land Tax':
                // Calculate based on area
                return selectedProperty.area * 0.5; // ₹0.5 per sq.ft
            case 'Business Tax':
                // Higher rate for commercial properties
                return selectedProperty.propertyType === 'Commercial' 
                    ? selectedProperty.area * 2 
                    : selectedProperty.area * 0.5;
            case 'Other':
                // Use custom amount
                return billData.customBaseAmount || 0;
            default:
                return 0;
        }
    }, [selectedProperty, settings, billData.taxType, billData.customBaseAmount]);

    const finalCalculations = useMemo(() => {
        const subtotal = baseAmount;
        let totalTaxAmount = 0;

        const detailedTaxes = manualTaxes.map(tax => {
            const taxValue = subtotal * (tax.rate / 100);
            totalTaxAmount += taxValue;
            return {
                ...tax,
                amount: taxValue,
            };
        });

        const grandTotal = subtotal + totalTaxAmount;

        return {
            subtotal,
            totalTaxAmount,
            grandTotal,
            detailedTaxes,
        };
    }, [baseAmount, manualTaxes]);
    // --- END CALCULATION LOGIC ---


    const handleBillSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { firestore } = initializeFirebase();
        
        // Validation
        if (!firestore || !billData.propertyId || !selectedProperty) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a property before generating the bill.',
            });
            return;
        }

        if (!settings) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Tax settings are not configured. Please configure settings first.',
            });
            return;
        }

        if (finalCalculations.grandTotal <= 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Bill amount must be greater than zero.',
            });
            return;
        }

        // Validate manual taxes
        const invalidTaxes = manualTaxes.filter(tax => tax.name.trim() === '' && tax.rate > 0);
        if (invalidTaxes.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please provide names for all additional charges or remove them.',
            });
            return;
        }

        setLoading(true);

        try {
            const propertyRef = doc(firestore, 'properties', billData.propertyId);
            const propertySnap = await getDoc(propertyRef);

            if (!propertySnap.exists()) {
                throw new Error("Property not found!");
            }

            // Generate unique IDs
            const taxRecordId = `TAX${Date.now()}`;
            const receiptNumber = generateReceiptNumber();

            // Create the tax record with all details
            const newTaxRecord = {
                id: taxRecordId,
                taxType: billData.taxType,
                hindiName: getTaxHindiName(billData.taxType),
                assessedAmount: finalCalculations.grandTotal,
                baseAmount: finalCalculations.subtotal,
                taxDetails: finalCalculations.detailedTaxes.filter(tax => tax.name.trim() !== ''),
                paymentStatus: 'Unpaid' as const,
                amountPaid: 0,
                assessmentYear: new Date(billData.date).getFullYear(),
                paymentDate: null,
                receiptNumber: receiptNumber,
                remarks: billData.remarks,
            };

            // Save to Firestore
            await updateDoc(propertyRef, {
                taxes: arrayUnion(newTaxRecord)
            });

            // Generate PDF
            generatePdfFile(
                selectedProperty,
                [newTaxRecord],
                settings
            );

            // Mark as generated
            setBillGenerated(true);

            toast({
                title: 'Success!',
                description: `Bill has been generated and saved. Receipt No: ${receiptNumber}`,
                duration: 5000,
            });

            // Reset form after a delay
            setTimeout(() => {
                setBillData({
                    propertyId: '',
                    taxType: 'Property Tax',
                    date: new Date().toISOString().split('T')[0],
                    remarks: '',
                    customBaseAmount: 0,
                });
                setManualTaxes([]);
                setBillGenerated(false);
            }, 2000);

        } catch (error: any) {
            console.error("Error generating bill: ", error);
            toast({
                variant: 'destructive',
                title: 'Operation Failed',
                description: error.message || 'An unknown error occurred during bill generation.',
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6 border border-border/50">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                    Generate New Tax Assessment & Bill • नया कर निर्धारण और बिल
                </h2>
                {!settings && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Settings Not Found!</AlertTitle>
                        <AlertDescription>
                            Tax rates are not configured. Please go to the Settings page and save the tax configuration before generating bills.
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleBillSubmit} className="space-y-8">
                    {/* Property Selection */}
                    <div>
                        <Label className="block text-sm font-semibold text-foreground mb-2">
                            Select User • उपयोगकर्ता चुनें *
                        </Label>
                        <Select 
                            value={billData.propertyId} 
                            onValueChange={(value) => handleSelectChange('propertyId', value)} 
                            required
                            disabled={!settings || loading}
                        >
                            <SelectTrigger className="h-12 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="-- Select User from Database --" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties?.map(prop => (
                                    <SelectItem key={prop.id} value={prop.id}>{prop.ownerName} ({prop.id})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tax Type and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                            <Label className="block text-sm font-semibold text-foreground mb-2">
                                Tax Type • कर का प्रकार *
                            </Label>
                            <Select
                                value={billData.taxType}
                                onValueChange={(value) => handleSelectChange('taxType', value)}
                                required
                                disabled={!settings || loading}
                            >
                                <SelectTrigger className="h-12 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Property Tax">Property Tax</SelectItem>
                                    <SelectItem value="Water Tax">Water Tax</SelectItem>
                                    <SelectItem value="Sanitation Tax">Sanitation Tax</SelectItem>
                                    <SelectItem value="Lighting Tax">Lighting Tax</SelectItem>
                                    <SelectItem value="Land Tax">Land Tax</SelectItem>
                                    <SelectItem value="Business Tax">Business Tax</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block text-sm font-semibold text-foreground mb-2">
                                Assessment Date • मूल्यांकन की तारीख *
                            </Label>
                            <Input
                                type="date"
                                name="date"
                                value={billData.date}
                                onChange={handleInputChange}
                                required
                                disabled={!settings || loading}
                                className="h-12 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Custom Base Amount for "Other" tax type */}
                    {billData.taxType === 'Other' && (
                        <div>
                            <Label className="block text-sm font-semibold text-foreground mb-2">
                                Base Amount • आधार राशि *
                            </Label>
                            <Input
                                type="number"
                                name="customBaseAmount"
                                value={billData.customBaseAmount}
                                onChange={handleInputChange}
                                placeholder="Enter base amount in ₹"
                                min="0"
                                step="0.01"
                                required
                                disabled={!settings || loading}
                                className="h-12 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Enter the base amount for this custom tax type
                            </p>
                        </div>
                    )}
                    
                    {/* Property Details and Base Amount */}
                    {selectedProperty && (
                        <div className="space-y-4">
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertTitle className="text-blue-900">Property Details • संपत्ति विवरण</AlertTitle>
                                <AlertDescription className="mt-3 space-y-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Owner Name</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.ownerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Property ID</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Property Type</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.propertyType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Area</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.area.toLocaleString()} sq.ft.</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">House No.</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.houseNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Mobile</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.mobileNumber}</p>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>

                            <Alert className="bg-green-50 border-green-200">
                                <AlertTitle className="text-green-900">Base Assessment • आधार मूल्यांकन</AlertTitle>
                                <AlertDescription className="mt-2">
                                    <p className="text-xl font-semibold mb-3 text-green-900">
                                        Base Amount: ₹{finalCalculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {billData.taxType === 'Property Tax' && (
                                            <>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    Rate: {settings?.propertyTaxRate || 0}% per sq.ft
                                                </Badge>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    Calculation: {selectedProperty.area} × {settings?.propertyTaxRate || 0}%
                                                </Badge>
                                            </>
                                        )}
                                        {billData.taxType === 'Water Tax' && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                Flat Rate: ₹{settings?.waterTaxRate || 0}
                                            </Badge>
                                        )}
                                        {(billData.taxType === 'Sanitation Tax' || billData.taxType === 'Lighting Tax') && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                Flat Rate
                                            </Badge>
                                        )}
                                        {billData.taxType === 'Other' && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                Custom Amount
                                            </Badge>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}


                    {/* Manual Tax Input Fields (NEW) */}
                    <div className="space-y-5 pt-6 border-t-2 border-border">
                        <h3 className="text-xl font-bold text-foreground flex items-center justify-between">
                            Manual Tax/Charges • अतिरिक्त कर/शुल्क 
                            <Button type="button" variant="outline" size="sm" onClick={addManualTax} disabled={loading} className="border-2 hover:bg-primary/5">
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Charge
                            </Button>
                        </h3>
                        {manualTaxes.map((tax, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 items-end p-4 bg-muted/30 rounded-lg border border-border/50">
                                <div className="col-span-2">
                                    <Label className="text-sm font-semibold text-foreground mb-2">Charge Name</Label>
                                    <Input
                                        type="text"
                                        value={tax.name}
                                        onChange={(e) => handleManualTaxChange(index, 'name', e.target.value)}
                                        placeholder="e.g., Penalty, Cess"
                                        required
                                        disabled={loading}
                                        className="h-11 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-sm font-semibold text-foreground mb-2">Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={tax.rate}
                                        onChange={(e) => handleManualTaxChange(index, 'rate', e.target.value)}
                                        min="0"
                                        step="0.01"
                                        required
                                        disabled={loading}
                                        className="h-11 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeManualTax(index)} disabled={loading} className="h-11 w-11">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Final Total */}
                    <div className="pt-6 border-t-2 border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg">
                        <p className="text-lg md:text-xl font-semibold text-foreground mb-3">
                            Total Tax/Charges: ₹{finalCalculations.totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-primary">
                            Grand Total (कुल राशि): ₹{finalCalculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Remarks */}
                    <div>
                        <Label className="block text-sm font-semibold text-foreground mb-2">
                            Remarks • टिप्पणी
                        </Label>
                        <Textarea
                            name="remarks"
                            value={billData.remarks}
                            onChange={handleInputChange}
                            placeholder="Additional remarks (optional)"
                            rows={3}
                            disabled={!settings || loading}
                            className="border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        ></Textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t border-border">
                        <Button
                            type="submit"
                            disabled={loading || !settings || finalCalculations.grandTotal <= 0 || !billData.propertyId}
                            className="flex-1 bg-gradient-to-r from-primary to-blue-700 text-white px-8 h-12 md:h-14 font-semibold hover:shadow-lg hover:from-primary/90 hover:to-blue-700/90 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                            <span className="hidden sm:inline">{loading ? 'Processing...' : 'Generate Bill & Download PDF • बिल बनाएं'}</span>
                            <span className="sm:hidden">{loading ? 'Processing...' : 'Generate Bill'}</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="sm:flex-initial px-8 h-12 md:h-14 border-2 font-semibold hover:bg-muted/50 transition-all"
                        >
                            Cancel • रद्द करें
                        </Button>
                    </div>

                    {billGenerated && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertTitle className="text-green-800">✓ Bill Generated Successfully!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                The tax bill has been saved to the property record and the PDF has been downloaded to your device.
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </div>
        </div>
    );
}
