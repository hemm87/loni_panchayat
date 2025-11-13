
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

// Placeholder for the actual PDF generation call (simulates calling a Firebase Cloud Function)
const generateBillPdf = async (billData: any) => {
    // In a real app, this would call a Cloud Function
    // The Cloud Function would:
    // 1. Receive the data (including tax rates and calculatedAmount)
    // 2. Use a PDF library (like pdfkit or Puppeteer) to create the document
    // 3. Upload the PDF to Firebase Storage
    // 4. Return the public download URL.

    console.log("Simulating PDF generation with data:", billData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
};


export function GenerateBillForm({ properties, settings, onFormSubmit, onCancel }: GenerateBillFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null); // New state for PDF link

    const [billData, setBillData] = useState({
        propertyId: '',
        taxType: 'Property Tax' as Property['taxes'][number]['taxType'],
        date: new Date().toISOString().split('T')[0],
        remarks: '',
    });
    
    // NEW STATE for manual tax rates
    const [manualTaxes, setManualTaxes] = useState<ManualTax[]>([
        { name: 'Surcharge', rate: 0 },
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBillData(prev => ({ ...prev, [name]: value }));
        setPdfUrl(null); // Reset PDF link on change
    };

    const handleSelectChange = (name: string, value: string) => {
        setBillData(prev => ({ ...prev, [name]: value }));
        setPdfUrl(null); // Reset PDF link on change
    };

    const handleManualTaxChange = (index: number, name: 'name' | 'rate', value: string) => {
        setManualTaxes(prev => prev.map((tax, i) => 
            i === index ? { ...tax, [name]: name === 'rate' ? Number(value) : value } : tax
        ));
        setPdfUrl(null); // Reset PDF link on change
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

    // Use a unique ID for the tax record
    const taxRecordId = useMemo(() => `TAX${Date.now()}`, []); 


    // --- CALCULATION LOGIC ---
    const baseAmount = useMemo(() => {
        if (!selectedProperty || !settings) return 0;
        
        switch (billData.taxType) {
            case 'Property Tax':
                return (settings.propertyTaxRate / 100) * selectedProperty.area;
            case 'Water Tax':
                return settings.waterTaxRate || 0;
            case 'Sanitation Tax':
                return 500; // Example flat rate
            case 'Lighting Tax':
                return 300; // Example flat rate
            default:
                return 0;
        }
    }, [selectedProperty, settings, billData.taxType]);

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
        if (!firestore || !billData.propertyId || finalCalculations.subtotal <= 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a property, ensure settings are configured, and the calculated amount is greater than zero.',
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

            // 1. SAVE THE TAX ASSESSMENT RECORD (This remains the same)
            const newTaxRecord = {
                id: taxRecordId,
                taxType: billData.taxType,
                hindiName: getTaxHindiName(billData.taxType),
                assessedAmount: finalCalculations.grandTotal, // Save the grand total
                baseAmount: finalCalculations.subtotal, // New field for base amount
                taxDetails: finalCalculations.detailedTaxes, // New field for detailed taxes
                paymentStatus: 'Unpaid' as const,
                amountPaid: 0,
                assessmentYear: new Date(billData.date).getFullYear(),
                paymentDate: null,
                receiptNumber: null,
                remarks: billData.remarks,
            };

            await updateDoc(propertyRef, {
                taxes: arrayUnion(newTaxRecord)
            });


            // 2. GENERATE AND GET PDF LINK (New Logic)
            const billToPdf = {
                ...newTaxRecord,
                propertyDetails: selectedProperty,
                panchayatSettings: settings,
                generatedDate: new Date().toISOString(),
            };

            const pdfDownloadUrl = await generateBillPdf(billToPdf);
            setPdfUrl(pdfDownloadUrl);

            toast({
                title: 'Success!',
                description: `Bill for ${billData.taxType} has been generated and is ready for print.`,
            });
            onFormSubmit(); // Notify parent component
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
                    
                    {/* Base Amount and Details */}
                    {selectedProperty && (
                        <Alert>
                            <AlertTitle>Base Assessment • आधार मूल्यांकन</AlertTitle>
                            <AlertDescription className="mt-2">
                                <p className="text-xl font-semibold mb-2">
                                    Subtotal (Base Amount): ₹{finalCalculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <Badge variant="secondary">Property Type: {selectedProperty.propertyType}</Badge>
                                    <Badge variant="secondary">Area: {selectedProperty.area.toLocaleString()} sq.ft.</Badge>
                                    {billData.taxType === 'Property Tax' && <Badge variant="secondary">Rate: {settings?.propertyTaxRate || 0}%</Badge>}
                                    {billData.taxType === 'Water Tax' && <Badge variant="secondary">Flat Rate: ₹{settings?.waterTaxRate || 0}</Badge>}
                                </div>
                            </AlertDescription>
                        </Alert>
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
                            disabled={loading || !settings || finalCalculations.grandTotal <= 0}
                            className="flex-1 bg-gradient-to-r from-primary to-blue-700 text-white px-8 h-12 md:h-14 font-semibold hover:shadow-lg hover:from-primary/90 hover:to-blue-700/90 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                            <span className="hidden sm:inline">{loading ? 'Processing...' : 'Generate Bill & Save Assessment • बिल बनाएं और मूल्यांकन सहेजें'}</span>
                            <span className="sm:hidden">{loading ? 'Processing...' : 'Generate Bill'}</span>
                        </Button>
                        
                        {pdfUrl && (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="sm:flex-initial">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full sm:w-auto px-8 h-12 md:h-14 bg-green-600 hover:bg-green-700 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-5 h-5" /> 
                                    <span>Print/Download Bill</span>
                                </Button>
                            </a>
                        )}

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
                </form>
            </div>
        </div>
    );
}
