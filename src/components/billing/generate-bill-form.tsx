
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
import { Loader2, FileText, Printer } from 'lucide-react';
import type { Property, PanchayatSettings } from '@/lib/types';
import { getTaxHindiName } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';


interface GenerateBillFormProps {
    properties: Property[];
    settings: PanchayatSettings | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function GenerateBillForm({ properties, settings, onFormSubmit, onCancel }: GenerateBillFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [billData, setBillData] = useState({
    propertyId: '',
    taxType: 'Property Tax' as Property['taxes'][number]['taxType'],
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setBillData(prev => ({ ...prev, [name]: value }));
  };
  
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === billData.propertyId);
  }, [properties, billData.propertyId]);

  const calculatedAmount = useMemo(() => {
    if (!selectedProperty || !settings) return 0;
    
    switch (billData.taxType) {
      case 'Property Tax':
        // Assumes propertyTaxRate is a percentage and area is in sq. ft.
        // Let's create a simple calculation: rate * area.
        return (settings.propertyTaxRate / 100) * selectedProperty.area;
      case 'Water Tax':
        // Assumes waterTaxRate is a flat annual fee.
        return settings.waterTaxRate || 0;
      // Other taxes can have flat rates or be based on other property attributes
      case 'Sanitation Tax':
        return 500; // Example flat rate
      case 'Lighting Tax':
        return 300; // Example flat rate
      default:
        return 0;
    }
  }, [selectedProperty, settings, billData.taxType]);


  const handleBillSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firestore } = initializeFirebase();
    if (!firestore || !billData.propertyId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a property and ensure Firestore is initialized.',
        });
        return;
    }
    if (calculatedAmount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Calculated amount is zero. Cannot generate bill.',
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

        const newTaxRecord = {
            id: `TAX${Date.now()}`,
            taxType: billData.taxType,
            hindiName: getTaxHindiName(billData.taxType),
            assessedAmount: Number(calculatedAmount),
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

        toast({
            title: 'Success!',
            description: `Bill for ${billData.taxType} has been generated for property ${billData.propertyId}.`,
        });
        onFormSubmit();
    } catch (error: any) {
        console.error("Error generating bill: ", error);
        toast({
            variant: 'destructive',
            title: 'Bill Generation Failed',
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Generate New Tax Assessment • नया कर निर्धारण
        </h2>
        {!settings && (
            <Alert variant="destructive" className="mb-6">
                <AlertTitle>Settings Not Found!</AlertTitle>
                <AlertDescription>
                    Tax rates are not configured. Please go to the Settings page and save the tax configuration before generating bills.
                </AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleBillSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-2">
              Select User • उपयोगकर्ता चुनें *
            </Label>
            <Select 
                value={billData.propertyId} 
                onValueChange={(value) => handleSelectChange('propertyId', value)} 
                required
                disabled={!settings}
            >
                <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg h-auto">
                    <SelectValue placeholder="-- Select User from Database --" />
                </SelectTrigger>
                <SelectContent>
                    {properties?.map(prop => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.ownerName} ({prop.id})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Tax Type • कर का प्रकार *
              </Label>
              <Select
                value={billData.taxType}
                onValueChange={(value) => handleSelectChange('taxType', value)}
                required
                disabled={!settings}
              >
                <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg h-auto">
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
                <Label className="block text-sm font-bold text-gray-700 mb-2">
                    Calculated Amount • गणना की गई राशि (₹)
                </Label>
                <div className="flex items-center h-12 px-4 py-3 border-2 bg-gray-100 border-gray-300 rounded-lg text-lg">
                   ₹{calculatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Assessment Date • मूल्यांकन की तारीख *
              </Label>
              <Input
                type="date"
                name="date"
                value={billData.date}
                onChange={handleInputChange}
                required
                disabled={!settings}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>
            <div className="md:col-span-2">
                {selectedProperty && (
                    <Alert>
                        <AlertTitle>Calculation Details</AlertTitle>
                        <AlertDescription className="flex flex-wrap gap-x-4 gap-y-1">
                           <Badge variant="secondary">Property Type: {selectedProperty.propertyType}</Badge>
                           <Badge variant="secondary">Area: {selectedProperty.area.toLocaleString()} sq.ft.</Badge>
                           {billData.taxType === 'Property Tax' && <Badge variant="secondary">Rate: {settings?.propertyTaxRate || 0}%</Badge>}
                           {billData.taxType === 'Water Tax' && <Badge variant="secondary">Flat Rate: ₹{settings?.waterTaxRate || 0}</Badge>}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-2">
              Remarks • टिप्पणी
            </Label>
            <Textarea
              name="remarks"
              value={billData.remarks}
              onChange={handleInputChange}
              placeholder="Additional remarks (optional)"
              rows={3}
              disabled={!settings}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            ></Textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={loading || !settings || calculatedAmount <= 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
              Generate Bill • बिल बनाएं
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="sm:flex-initial px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all"
            >
              Cancel • रद्द करें
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
