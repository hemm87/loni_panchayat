
'use client';
import { useState, useMemo, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Printer, PlusCircle, Trash2, AlertCircle } from 'lucide-react'; // Added PlusCircle and Trash2
import type { Property, PanchayatSettings } from '@/lib/types';
import { getTaxHindiName, getFinancialYear, parseFY } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/**
 * Represents a manual tax/charge that can be added to a bill
 */
interface ManualTax {
    name: string;
    rate: number; // Percentage
}

/**
 * Props for the GenerateBillForm component
 */
interface GenerateBillFormProps {
    properties: Property[];
    settings: PanchayatSettings | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

/**
 * Detailed tax calculation result
 */
interface TaxCalculation {
    name: string;
    rate: number;
    amount: number;
}

/**
 * Complete bill calculation result
 */
interface BillCalculations {
    subtotal: number;
    totalTaxAmount: number;
    grandTotal: number;
    detailedTaxes: TaxCalculation[];
}

// Import the actual PDF generator
import { generateBillPdf as generatePdfFile } from '@/lib/pdf-generator';

/**
 * Generates a unique receipt number in format RCP{YY}{MM}{XXXX}
 * @returns Receipt number string
 */
const generateReceiptNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP${year}${month}${random}`;
};

/**
 * Validates that all manual taxes have names if they have rates
 * @param taxes - Array of manual taxes to validate
 * @returns True if valid, false otherwise
 */
const validateManualTaxes = (taxes: ManualTax[]): boolean => {
    return !taxes.some(tax => tax.name.trim() === '' && tax.rate > 0);
};


/**
 * Form component for generating tax assessment bills
 * Handles property selection, tax calculation, and bill generation with PDF output
 */
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
    
    // State for manual tax rates/charges
    const [manualTaxes, setManualTaxes] = useState<ManualTax[]>([]);

    // Keyboard shortcut for adding manual taxes (Ctrl/Cmd + Shift + A)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                if (!loading) {
                    addManualTax();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [loading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBillData(prev => ({ ...prev, [name]: value }));
        setBillGenerated(false);
    };

    const handleSelectChange = (name: string, value: string) => {
        setBillData(prev => ({ ...prev, [name]: value }));
        setBillGenerated(false);
    };

    /**
     * Handles changes to manual tax fields
     */
    const handleManualTaxChange = (index: number, field: 'name' | 'rate', value: string) => {
        setManualTaxes(prev => prev.map((tax, i) => {
            if (i !== index) return tax;
            
            if (field === 'rate') {
                const numericValue = Number(value);
                // Prevent negative rates
                return { ...tax, rate: Math.max(0, numericValue) };
            }
            return { ...tax, [field]: value };
        }));
        setBillGenerated(false);
    };

    /**
     * Adds a new empty manual tax entry
     */
    const addManualTax = () => {
        setManualTaxes(prev => [...prev, { name: '', rate: 0 }]);
        setBillGenerated(false);
    };

    /**
     * Removes a manual tax entry by index
     */
    const removeManualTax = (index: number) => {
        setManualTaxes(prev => prev.filter((_, i) => i !== index));
        setBillGenerated(false);
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

    /**
     * Calculates final bill amounts including all manual taxes
     */
    const finalCalculations = useMemo<BillCalculations>(() => {
        const subtotal = baseAmount;
        let totalTaxAmount = 0;

        // Only include taxes with valid names
        const detailedTaxes: TaxCalculation[] = manualTaxes
            .filter(tax => tax.name.trim() !== '')
            .map(tax => {
                const taxValue = subtotal * (tax.rate / 100);
                totalTaxAmount += taxValue;
                return {
                    name: tax.name,
                    rate: tax.rate,
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
        if (!validateManualTaxes(manualTaxes)) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please provide names for all additional charges or remove them.',
            });
            return;
        }

        setLoading(true);

        try {
            // Verify property exists in Firestore
            const propertyRef = doc(firestore, 'properties', billData.propertyId);
            const propertySnap = await getDoc(propertyRef);

            if (!propertySnap.exists()) {
                throw new Error("Property not found in database!");
            }

            // Generate unique identifiers
            const taxRecordId = `TAX${Date.now()}`;
            const receiptNumber = generateReceiptNumber();

            // Create the complete tax record with all details
            // Get current FY and use its start year as assessment year
            const currentFY = getFinancialYear(new Date(billData.date));
            const { startYear } = parseFY(currentFY);
            
            const newTaxRecord = {
                id: taxRecordId,
                taxType: billData.taxType,
                hindiName: getTaxHindiName(billData.taxType),
                assessedAmount: finalCalculations.grandTotal,
                baseAmount: finalCalculations.subtotal,
                taxDetails: finalCalculations.detailedTaxes, // Already filtered in calculations
                paymentStatus: 'Unpaid' as const,
                amountPaid: 0,
                assessmentYear: startYear, // FY start year (e.g., 2024 for FY 2024-25)
                paymentDate: null,
                receiptNumber: receiptNumber,
                remarks: billData.remarks.trim(),
            };

            // Save tax record to Firestore
            await updateDoc(propertyRef, {
                taxes: arrayUnion(newTaxRecord)
            });

            // Generate and download PDF
            generatePdfFile(
                selectedProperty,
                [newTaxRecord],
                settings
            );

            // Mark as successfully generated
            setBillGenerated(true);

            // Show success notification
            toast({
                title: 'Success!',
                description: `Bill generated and saved successfully. Receipt No: ${receiptNumber}`,
                duration: 5000,
            });

            // Trigger parent callback
            onFormSubmit();

            // Reset form after a brief delay to allow user to see success message
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

        } catch (error: unknown) {
            console.error("Error generating bill:", error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while generating the bill.';
            
            toast({
                variant: 'destructive',
                title: 'Bill Generation Failed',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
            <div className="card-premium rounded-2xl shadow-xl p-6 md:p-10 mb-6 border-2 border-border/50 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-primary">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Generate Tax Assessment
                        </h2>
                        <p className="text-lg text-muted-foreground mt-1">नया कर निर्धारण और बिल</p>
                    </div>
                </div>
                {!settings && (
                    <Alert variant="destructive" className="mb-6 border-2 shadow-md animate-fade-in">
                         <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="font-bold text-lg">Settings Not Found!</AlertTitle>
                        <AlertDescription className="mt-2">
                            Panchayat settings are not configured. Please go to the Settings page and save them before generating bills.
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleBillSubmit} className="space-y-8">
                    {/* Property Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground/90">
                            Select Property Owner • संपत्ति मालिक चुनें *
                        </Label>
                        <Select 
                            value={billData.propertyId} 
                            onValueChange={(value) => handleSelectChange('propertyId', value)} 
                            required
                            disabled={!settings || loading}
                        >
                            <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                                <SelectValue placeholder="-- Select Property Owner from Database --" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties && properties.length > 0 ? (
                                    properties.map(prop => (
                                        <SelectItem key={prop.id} value={prop.id}>
                                            🏠 {prop.ownerName} ({prop.id})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-properties" disabled>
                                        No properties available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {properties && properties.length === 0 && (
                            <p className="text-sm badge-warning mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                No properties found. Please register properties first.
                            </p>
                        )}
                    </div>

                    {/* Tax Type and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-foreground/90">
                                Tax Type • कर का प्रकार *
                            </Label>
                            <Select
                                value={billData.taxType}
                                onValueChange={(value) => handleSelectChange('taxType', value)}
                                required
                                disabled={!settings || loading}
                            >
                                <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Property Tax">🏠 Property Tax</SelectItem>
                                    <SelectItem value="Water Tax">💧 Water Tax</SelectItem>
                                    <SelectItem value="Sanitation Tax">🧹 Sanitation Tax</SelectItem>
                                    <SelectItem value="Lighting Tax">💡 Lighting Tax</SelectItem>
                                    <SelectItem value="Land Tax">🌍 Land Tax</SelectItem>
                                    <SelectItem value="Business Tax">💼 Business Tax</SelectItem>
                                    <SelectItem value="Other">📋 Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-foreground/90">
                                Assessment Date • मूल्यांकन की तारीख *
                            </Label>
                            <Input
                                type="date"
                                name="date"
                                value={billData.date}
                                onChange={handleInputChange}
                                required
                                disabled={!settings || loading}
                                className="h-12 border-2 shadow-sm hover:shadow-md transition-all"
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
                            <Alert className="bg-blue-50 border-blue-200" role="region" aria-label="Property Information">
                                <AlertTitle className="text-blue-900">Property Details • संपत्ति विवरण</AlertTitle>
                                <AlertDescription className="mt-3 space-y-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Owner Name • मालिक का नाम</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.ownerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Property ID • संपत्ति आईडी</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Property Type • संपत्ति का प्रकार</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.propertyType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Area • क्षेत्रफल</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.area.toLocaleString('en-IN')} sq.ft.</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">House No. • मकान नंबर</p>
                                            <p className="text-sm font-semibold text-blue-900">{selectedProperty.houseNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Mobile • मोबाइल</p>
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


                    {/* Manual Tax Input Fields */}
                    <div className="space-y-6 pt-8 border-t-2 border-gradient-primary">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center border-2 border-warning/30">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-headline font-bold text-foreground">
                                        Additional Charges
                                    </h3>
                                    <p className="text-sm text-muted-foreground">अतिरिक्त कर/शुल्क</p>
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={addManualTax} 
                                disabled={loading} 
                                className="h-10 px-4 border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                                title="Add new charge (Ctrl+Shift+A)"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Charge
                            </Button>
                        </div>
                        
                        {manualTaxes.length === 0 && (
                            <div className="text-center py-8 px-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed border-border/50 animate-fade-in">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                                    <PlusCircle className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No additional charges added. Click "Add Charge" to include penalties, cess, or other charges.
                                </p>
                            </div>
                        )}
                        
                        {manualTaxes.map((tax, index) => (
                            <div 
                                key={index} 
                                className="grid grid-cols-5 gap-4 items-end p-5 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border-2 border-border/50 shadow-sm hover:shadow-md transition-all animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90">
                                        Charge Name • शुल्क का नाम
                                    </Label>
                                    <Input
                                        type="text"
                                        value={tax.name}
                                        onChange={(e) => handleManualTaxChange(index, 'name', e.target.value)}
                                        placeholder="e.g., Penalty, Cess, Late Fee"
                                        disabled={loading}
                                        className="h-12 border-2 shadow-sm hover:shadow-md transition-all"
                                        aria-label={`Charge name ${index + 1}`}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90">
                                        Rate (%) • दर
                                    </Label>
                                    <Input
                                        type="number"
                                        value={tax.rate}
                                        onChange={(e) => handleManualTaxChange(index, 'rate', e.target.value)}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        disabled={loading}
                                        className="h-12 border-2 shadow-sm hover:shadow-md transition-all font-semibold"
                                        aria-label={`Charge rate ${index + 1}`}
                                    />
                                    {tax.rate > 0 && selectedProperty && (
                                        <p className="text-sm badge-success inline-flex items-center gap-1 px-2 py-1 rounded">
                                            = ₹{(baseAmount * (tax.rate / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    onClick={() => removeManualTax(index)} 
                                    disabled={loading} 
                                    className="h-12 w-12 shadow-md hover:shadow-lg active:scale-95 transition-all"
                                    title="Remove this charge"
                                    aria-label={`Remove charge ${index + 1}`}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Final Total */}
                    <div className="pt-8 border-t-2 border-gradient-primary bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-6 md:p-8 rounded-2xl shadow-lg space-y-4 animate-fade-in" role="region" aria-label="Bill Summary">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-md">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-headline font-bold text-foreground">Bill Summary</h3>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                            <span className="text-base font-medium text-muted-foreground">Base Amount • आधार राशि:</span>
                            <span className="text-xl font-bold text-foreground">
                                ₹{finalCalculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        
                        {finalCalculations.detailedTaxes.length > 0 && (
                            <>
                                <div className="border-t-2 border-border/30 pt-3 space-y-2">
                                    {finalCalculations.detailedTaxes.map((tax, idx) => (
                                        <div 
                                            key={idx} 
                                            className="flex justify-between items-center text-sm py-2 px-3 bg-white/50 rounded-lg animate-fade-in"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <span className="font-medium text-foreground/80">
                                                {tax.name} ({tax.rate}%):
                                            </span>
                                            <span className="font-bold text-foreground">
                                                ₹{tax.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-border/30 pt-3 py-2">
                                    <span className="text-lg font-bold text-foreground">Additional Charges • अतिरिक्त शुल्क:</span>
                                    <span className="text-xl font-bold text-warning">
                                        ₹{finalCalculations.totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </>
                        )}
                        
                        <div className="flex justify-between items-center border-t-2 border-primary/30 pt-4 mt-4 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-4 rounded-xl shadow-inner">
                            <span className="text-xl md:text-2xl font-headline font-bold text-foreground">Grand Total • कुल राशि:</span>
                            <span className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                ₹{finalCalculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground/90">
                            Remarks • टिप्पणी
                        </Label>
                        <Textarea
                            name="remarks"
                            value={billData.remarks}
                            onChange={handleInputChange}
                            placeholder="Additional remarks (optional)"
                            rows={3}
                            disabled={!settings || loading}
                            className="border-2 shadow-sm hover:shadow-md transition-all resize-none"
                        ></Textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-border">
                        <Button
                            type="submit"
                            disabled={loading || !settings || finalCalculations.grandTotal <= 0 || !billData.propertyId}
                            className="flex-1 bg-gradient-to-r from-primary via-primary to-accent text-white px-8 h-14 md:h-16 font-bold text-lg rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                            aria-label="Generate bill and download PDF"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Printer className="w-6 h-6" />}
                            <span className="hidden sm:inline">{loading ? 'Generating Bill...' : 'Generate Bill & Download PDF • बिल बनाएं'}</span>
                            <span className="sm:hidden">{loading ? 'Generating...' : 'Generate Bill'}</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="sm:flex-initial px-8 h-14 md:h-16 border-2 rounded-xl font-bold text-lg hover:bg-muted/50 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            aria-label="Cancel bill generation"
                        >
                            Cancel • रद्द करें
                        </Button>
                    </div>

                    {/* Validation Helper Text */}
                    {!billData.propertyId && (
                        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            ⚠️ Please select a property to continue
                        </p>
                    )}
                    {billData.propertyId && finalCalculations.grandTotal <= 0 && (
                        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            ⚠️ Bill amount must be greater than zero
                        </p>
                    )}

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
