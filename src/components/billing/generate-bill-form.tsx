
'use client';
import { useState } from 'react';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Printer } from 'lucide-react';
import type { Property } from '@/lib/types';
import { getTaxHindiName } from '@/lib/utils';


interface GenerateBillFormProps {
    properties: Property[];
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function GenerateBillForm({ properties, onFormSubmit, onCancel }: GenerateBillFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [billData, setBillData] = useState({
    propertyId: '',
    taxType: 'Property Tax' as Property['taxes'][number]['taxType'],
    amount: '',
    paymentMode: 'Cash',
    date: new Date().toISOString().split('T')[0], // Default to today
    remarks: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setBillData(prev => ({ ...prev, [name]: value }));
  };

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
            assessedAmount: Number(billData.amount),
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
          Generate Bill / Receipt • रसीद बनाएँ
        </h2>

        <form onSubmit={handleBillSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-2">
              Select User • उपयोगकर्ता चुनें *
            </Label>
            <Select 
                value={billData.propertyId} 
                onValueChange={(value) => handleSelectChange('propertyId', value)} 
                required
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
                Bill Type • बिल का प्रकार *
              </Label>
              <Select
                value={billData.taxType}
                onValueChange={(value) => handleSelectChange('taxType', value)}
                required
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
                Amount • राशि (₹) *
              </Label>
              <Input
                type="number"
                name="amount"
                value={billData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount in ₹"
                required
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Payment Mode • भुगतान मोड *
              </Label>
              <Select
                value={billData.paymentMode}
                onValueChange={(value) => handleSelectChange('paymentMode', value)}
                required
              >
                <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg h-auto">
                    <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Cash">Cash - नकद</SelectItem>
                    <SelectItem value="Online">Online - ऑनलाइन</SelectItem>
                    <SelectItem value="Cheque">Cheque - चेक</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Date • तारीख *
              </Label>
              <Input
                type="date"
                name="date"
                value={billData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              />
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            ></Textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={loading}
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

      <div className="bg-white rounded-xl shadow-md p-8 border-4 border-dashed border-gray-300">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">लॉनी ग्राम पंचायत</h3>
          <p className="text-lg text-gray-600">Loni Gram Panchayat</p>
          <p className="text-gray-600">Tax Receipt Preview • कर रसीद पूर्वावलोकन</p>
        </div>
        <div className="text-center text-gray-500 py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Receipt preview will appear here</p>
          <p>रसीद पूर्वावलोकन यहां दिखाई देगा</p>
        </div>
      </div>
    </div>
  );

    