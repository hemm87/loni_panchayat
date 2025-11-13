
'use client';
import { useState, useMemo, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Printer, Download, Search, AlertCircle } from 'lucide-react';
import type { Property, PanchayatSettings, TaxRecord } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';


interface GenerateBillFormProps {
    properties: Property[];
    settings: PanchayatSettings | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function GenerateBillForm({ properties, settings, onFormSubmit, onCancel }: GenerateBillFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);

    useEffect(() => {
        if(selectedProperty) {
            // Pre-select all taxes for the chosen year by default
            const defaultTaxes = selectedProperty.taxes
                .filter(t => t.assessmentYear === year)
                .map(t => t.taxType);
            setSelectedTaxes(defaultTaxes);
        } else {
            setSelectedTaxes([]);
        }
    }, [selectedProperty, year]);


    const handleSearch = () => {
        setLoading(true);
        setSearchResults([]);
        setSelectedProperty(null);

        if (!searchTerm.trim()) {
            setLoading(false);
            return;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = properties.filter(property =>
            property.ownerName.toLowerCase().includes(lowercasedFilter) ||
            (property.houseNo && property.houseNo.toLowerCase().includes(lowercasedFilter)) ||
            (property.id && property.id.toLowerCase().includes(lowercasedFilter))
        );
        
        setSearchResults(filteredData);
        setLoading(false);
    };
    
    const handleBillSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedProperty || selectedTaxes.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a property and at least one tax type to include.',
            });
            return;
        }
        
        setGenerating(true);
        setPdfUrl(null);
        
        try {
            const { app } = initializeFirebase();
            const functions = getFunctions(app);
            const generateBillFn = httpsCallable(functions, 'generateBill');

            const payload = {
                propertyId: selectedProperty.id,
                year: year,
                taxTypes: selectedTaxes,
                language: 'bilingual' as const,
            };

            const result = await generateBillFn(payload);
            const data = result.data as { success: boolean; downloadUrl: string, billId: string };

            if (data.success && data.downloadUrl) {
                setPdfUrl(data.downloadUrl);
                toast({
                    title: 'Bill Generated Successfully!',
                    description: `Bill ID: ${data.billId}`,
                });
                onFormSubmit();
            } else {
                throw new Error('Cloud function did not return a success status or download URL.');
            }

        } catch (error: any) {
            console.error("Error calling generateBill function:", error);
            toast({
                variant: 'destructive',
                title: 'Bill Generation Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setGenerating(false);
        }
    };
    
    const availableTaxesForYear = useMemo(() => {
        if (!selectedProperty) return [];
        return selectedProperty.taxes.filter(t => t.assessmentYear === year);
    }, [selectedProperty, year]);


    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-border">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Generate Bill / Receipt • बिल / रसीद बनाएं
                </h2>
                {!settings && (
                    <Alert variant="destructive" className="mb-6">
                         <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Settings Not Found!</AlertTitle>
                        <AlertDescription>
                            Panchayat settings are not configured. Please go to the Settings page and save them before generating bills.
                        </AlertDescription>
                    </Alert>
                )}
                
                {/* Search Section */}
                <div className="flex gap-2 mb-4">
                    <Input 
                        placeholder="Search by Owner Name, House No, or Property ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={!settings}
                    />
                    <Button onClick={handleSearch} disabled={loading || !searchTerm || !settings}>
                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && !selectedProperty && (
                    <div className="space-y-2 mb-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold">Search Results:</h3>
                        {searchResults.map(prop => (
                            <button key={prop.id} onClick={() => setSelectedProperty(prop)} className="block w-full text-left p-2 rounded-md hover:bg-accent">
                                <p className="font-bold">{prop.ownerName}</p>
                                <p className="text-sm text-muted-foreground">{prop.houseNo}, {prop.address}</p>
                            </button>
                        ))}
                    </div>
                )}


                {selectedProperty && (
                    <form onSubmit={handleBillSubmit} className="space-y-6 animate-in fade-in-50">
                        {/* Selected Property Display */}
                        <Alert variant="default" className="border-primary">
                            <AlertTitle className="flex justify-between items-center">
                               <span>Selected Property: {selectedProperty.ownerName}</span>
                               <Button variant="link" size="sm" onClick={() => { setSelectedProperty(null); setSearchResults([]); setSearchTerm(''); }}>Change</Button>
                            </AlertTitle>
                            <AlertDescription>
                                ID: {selectedProperty.id} | Address: {selectedProperty.houseNo}, {selectedProperty.address}
                            </AlertDescription>
                        </Alert>

                        {/* Bill Options */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label className="font-bold">Assessment Year</Label>
                                <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                            </div>
                        </div>

                        {/* Tax Type Selection */}
                        <div>
                             <Label className="font-bold">Taxes to Include in Bill</Label>
                             <div className="space-y-2 mt-2 p-4 border rounded-md">
                                {availableTaxesForYear.length > 0 ? availableTaxesForYear.map((tax: TaxRecord) => (
                                    <div key={tax.id} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={tax.id}
                                            checked={selectedTaxes.includes(tax.taxType)}
                                            onCheckedChange={(checked) => {
                                                setSelectedTaxes(prev => checked ? [...prev, tax.taxType] : prev.filter(t => t !== tax.taxType))
                                            }}
                                        />
                                        <Label htmlFor={tax.id} className="flex justify-between w-full">
                                            <span>{tax.taxType} ({tax.hindiName})</span>
                                            <Badge variant={tax.paymentStatus === 'Paid' ? 'secondary' : tax.paymentStatus === 'Partial' ? 'outline' : 'destructive'}>
                                                Due: ₹{(tax.assessedAmount - tax.amountPaid).toLocaleString()}
                                            </Badge>
                                        </Label>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No tax records found for the year {year}.</p>
                                )}
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={generating || selectedTaxes.length === 0}
                                className="flex-1 bg-primary text-primary-foreground px-8 py-4 font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                                {generating ? 'Generating...' : 'Generate Bill'}
                            </Button>
                            
                            {pdfUrl && (
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="sm:flex-initial">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-6 h-6" /> Print/Download
                                    </Button>
                                </a>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={generating}
                                className="sm:flex-initial px-8 py-4 bg-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
