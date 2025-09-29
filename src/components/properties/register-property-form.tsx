'use client';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Property } from '@/lib/types';

interface RegisterPropertyFormProps {
    onFormSubmit: () => void;
}

export function RegisterPropertyForm({ onFormSubmit }: RegisterPropertyFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    fatherName: '',
    mobileNumber: '',
    houseNo: '',
    address: '',
    propertyType: '' as 'Residential' | 'Commercial' | 'Agricultural',
    area: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: 'Residential' | 'Commercial' | 'Agricultural') => {
    setFormData(prev => ({ ...prev, propertyType: value }));
  };
  
  const generatePropertyId = () => {
    // Simple ID generation, can be made more robust
    return `PROP${Date.now()}`;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firestore is not initialized.',
        });
        return;
    }
    setLoading(true);

    try {
      const newProperty: Omit<Property, 'id'> = {
        ...formData,
        area: Number(formData.area),
        aadhaarHash: '', // Will be handled securely later
        photoUrl: 'https://picsum.photos/seed/newprop/600/400', // Placeholder
        photoHint: 'new property',
        taxes: [],
      };
      
      const propertyId = generatePropertyId();
      const docRef = doc(firestore, 'properties', propertyId);
      await setDoc(docRef, newProperty);

      toast({
        title: 'Success',
        description: 'New property has been registered successfully.',
      });
      onFormSubmit(); // Callback to switch view
    } catch (error: any) {
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
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Register New User / Property</CardTitle>
            <CardDescription>Fill in the details below to add a new property to the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name (मालिक का नाम)</Label>
                        <Input id="ownerName" value={formData.ownerName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name (पिता का नाम)</Label>
                        <Input id="fatherName" value={formData.fatherName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobileNumber">Mobile Number (मोबाइल नंबर)</Label>
                        <Input id="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type (संपत्ति का प्रकार)</Label>
                        <Select onValueChange={handleSelectChange} required>
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
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="houseNo">House No. (मकान नंबर)</Label>
                        <Input id="houseNo" value={formData.houseNo} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address (पता)</Label>
                        <Input id="address" value={formData.address} onChange={handleChange} required />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="area">Area in sq. ft. (क्षेत्रफल वर्ग फुट में)</Label>
                        <Input id="area" type="number" value={formData.area} onChange={handleChange} required />
                    </div>
                </div>

                {/* Full-width submit button */}
                <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Property
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}
