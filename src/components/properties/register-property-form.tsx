
'use client';
import { useState } from 'react';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, PlusCircle, MinusCircle } from 'lucide-react';
import type { Property, TaxRecord } from '@/lib/types';
import { getTaxHindiName } from '@/lib/utils';
import { useRouter } from 'next/navigation';


interface RegisterPropertyFormProps {
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function RegisterPropertyForm({ onFormSubmit, onCancel }: RegisterPropertyFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialTaxState: Omit<TaxRecord, 'id' | 'hindiName' | 'paymentStatus' | 'amountPaid' | 'assessmentYear' | 'paymentDate' | 'receiptNumber'> = { taxType: 'Property Tax', assessedAmount: 0 };

  const [formData, setFormData] = useState({
    ownerName: '',
    fatherName: '',
    mobileNumber: '',
    houseNo: '',
    address: '',
    aadhaarHash: '',
    propertyType: '' as Property['propertyType'],
    area: '',
  });

  const [taxes, setTaxes] = useState<Omit<TaxRecord, 'id' | 'hindiName' | 'paymentStatus' | 'amountPaid' | 'assessmentYear' | 'paymentDate' | 'receiptNumber'>[]>([initialTaxState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: Property['propertyType']) => {
    setFormData(prev => ({...prev, propertyType: value}));
  };

  const handleTaxChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newTaxes = [...taxes];
    newTaxes[index] = { ...newTaxes[index], [name]: name === 'assessedAmount' ? parseFloat(value) || 0 : value as any };
    setTaxes(newTaxes);
  };
  
  const handleTaxTypeChange = (index: number, value: TaxRecord['taxType']) => {
    const newTaxes = [...taxes];
    newTaxes[index] = { ...newTaxes[index], taxType: value };
    setTaxes(newTaxes);
  }

  const addTaxField = () => {
    setTaxes([...taxes, initialTaxState]);
  };

  const removeTaxField = (index: number) => {
    const newTaxes = taxes.filter((_, i) => i !== index);
    setTaxes(newTaxes);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firestore } = initializeFirebase();
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firestore is not initialized.',
        });
        return;
    }
    setLoading(true);

    const propertyId = `PROP${Date.now()}`;
    const propertyData: Omit<Property, 'id'> = {
      ...formData,
      area: Number(formData.area),
      photoUrl: `https://picsum.photos/seed/${propertyId}/600/400`,
      photoHint: 'new property',
      taxes: taxes.filter(t => t.assessedAmount > 0).map((t, index) => ({
        id: `TAX${Date.now()}${index}`,
        taxType: t.taxType,
        hindiName: getTaxHindiName(t.taxType),
        assessedAmount: Number(t.assessedAmount),
        paymentStatus: 'Unpaid' as const,
        amountPaid: 0,
        assessmentYear: new Date().getFullYear(),
        paymentDate: null,
        receiptNumber: null,
      })),
    };

    try {
      await setDoc(doc(firestore, 'properties', propertyId), propertyData);
      toast({
        title: 'Success!',
        description: `Property ${propertyId} has been registered.`,
      });
      onFormSubmit();
    } catch (error: any) {
      console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Register New User • नया उपयोगकर्ता पंजीकरण
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">Full Name • पूरा नाम *</Label>
              <Input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Enter full name" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
            </div>
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">Father's/Husband's Name • पिता/पति का नाम *</Label>
              <Input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Enter father's/husband's name" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
            </div>
            <div>
              <Label htmlFor="mobileNumber" className="block text-sm font-bold text-gray-700 mb-2">Mobile Number • मोबाइल नंबर *</Label>
              <Input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength={10} required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
              <p className="text-xs text-gray-500 mt-1">Enter a 10-digit mobile number without country code.</p>
            </div>
            <div>
              <Label htmlFor="aadhaarHash" className="block text-sm font-bold text-gray-700 mb-2">Aadhar Number • आधार नंबर</Label>
              <Input type="tel" name="aadhaarHash" value={formData.aadhaarHash} onChange={handleInputChange} placeholder="12-digit Aadhar number" pattern="[0-9]{12}" maxLength={12} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
              <p className="text-xs text-gray-500 mt-1">Enter 12-digit Aadhar number without spaces.</p>
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-bold text-gray-700 mb-2">Address • पता *</Label>
              <Textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Complete address" rows={3} maxLength={200} required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"></Textarea>
            </div>
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">House/Property Number • संपत्ति नंबर *</Label>
              <Input type="text" name="houseNo" value={formData.houseNo} onChange={handleInputChange} placeholder="e.g., Plot-101" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
            </div>
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">Property Type • संपत्ति का प्रकार *</Label>
              <Select name="propertyType" value={formData.propertyType} onValueChange={handleSelectChange} required>
                <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg h-auto">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Residential">Residential - आवासीय</SelectItem>
                    <SelectItem value="Commercial">Commercial - व्यावसायिक</SelectItem>
                    <SelectItem value="Agricultural">Agricultural - कृषि</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
                <Label className="block text-sm font-bold text-gray-700 mb-2">Area (sq. ft) • क्षेत्रफल</Label>
                <Input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="Area in square feet" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg" />
            </div>
        </div>

        <div className="space-y-4 pt-4 border-t-2 border-gray-200 mt-6">
          <h3 className="text-xl font-bold text-gray-800">Taxes • कर</h3>
          {taxes.map((tax, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <Label className="block text-sm font-bold text-gray-700 mb-1">Tax Type</Label>
                 <Select name="taxType" value={tax.taxType} onValueChange={(value: TaxRecord['taxType']) => handleTaxTypeChange(index, value)}>
                    <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg h-auto">
                      <SelectValue placeholder="Select Tax Type" />
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
                <Label className="block text-sm font-bold text-gray-700 mb-1">Annual Amount (₹)</Label>
                <Input type="number" name="assessedAmount" value={tax.assessedAmount} onChange={(e) => handleTaxChange(index, e)} placeholder="Amount in ₹" required min="0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"/>
              </div>
              <div className="flex items-end h-full">
                {taxes.length > 1 && (
                  <Button type="button" variant="destructive" onClick={() => removeTaxField(index)} className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                    <MinusCircle className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={addTaxField} className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-all">
            <PlusCircle className="w-6 h-6" />
            Add Another Tax • एक और कर जोड़ें
          </Button>
        </div>


        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Save & Register • सहेजें और पंजीकृत करें
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all"
          >
            Cancel • रद्द करें
          </Button>
        </div>
      </form>
    </div>
  );
}
