
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
import { getTaxHindiName, getFinancialYear, parseFY } from '@/lib/utils';
import { useRouter } from 'next/navigation';


interface RegisterPropertyFormProps {
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function RegisterPropertyForm({ onFormSubmit, onCancel }: RegisterPropertyFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Get current financial year
  const currentFY = getFinancialYear();
  const { startYear: currentFYStartYear } = parseFY(currentFY);

  const initialTaxState: Omit<TaxRecord, 'id' | 'hindiName' | 'paymentStatus' | 'amountPaid' | 'assessmentYear' | 'paymentDate' | 'receiptNumber'> = { taxType: 'Property Tax', assessedAmount: 0 };
  
  // State for previous year pending amounts (for migration from manual system)
  interface PreviousPendingAmount {
    financialYear: string;
    taxType: TaxRecord['taxType'];
    amount: number;
  }
  const [previousPendingAmounts, setPreviousPendingAmounts] = useState<PreviousPendingAmount[]>([]);

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
  
  // Handlers for previous pending amounts (migration support)
  const addPreviousPendingAmount = () => {
    const lastFY = getFinancialYear(new Date(new Date().getFullYear() - 1, 3, 1)); // Get previous FY
    setPreviousPendingAmounts([
      ...previousPendingAmounts, 
      { financialYear: lastFY, taxType: 'Property Tax', amount: 0 }
    ]);
  };
  
  const removePreviousPendingAmount = (index: number) => {
    setPreviousPendingAmounts(previousPendingAmounts.filter((_, i) => i !== index));
  };
  
  const handlePreviousPendingChange = (index: number, field: keyof PreviousPendingAmount, value: string | number) => {
    const updated = [...previousPendingAmounts];
    updated[index] = { ...updated[index], [field]: value };
    setPreviousPendingAmounts(updated);
  };
  
  // Generate last 5 financial years for dropdown
  const generatePreviousFYs = () => {
    const fys: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date(new Date().getFullYear() - i, 3, 1); // April 1st of previous years
      fys.push(getFinancialYear(date));
    }
    return fys;
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
    // Create current year tax records with FY start year
    const currentYearTaxes = taxes.filter(t => t.assessedAmount > 0).map((t, index) => ({
      id: `TAX${Date.now()}${index}`,
      taxType: t.taxType,
      hindiName: getTaxHindiName(t.taxType),
      assessedAmount: Number(t.assessedAmount),
      paymentStatus: 'Unpaid' as const,
      amountPaid: 0,
      assessmentYear: currentFYStartYear, // Use FY start year instead of calendar year
      paymentDate: null,
      receiptNumber: null,
    }));
    
    // Create tax records for previous year pending amounts (migration support)
    const previousYearTaxes = previousPendingAmounts.map((prev, index) => {
      const { startYear } = parseFY(prev.financialYear);
      return {
        id: `PREV${Date.now()}${index}`,
        taxType: prev.taxType,
        hindiName: getTaxHindiName(prev.taxType),
        assessedAmount: prev.amount,
        paymentStatus: 'Unpaid' as const,
        amountPaid: 0,
        assessmentYear: startYear,
        paymentDate: null,
        receiptNumber: null,
      };
    });
    
    const propertyData: Omit<Property, 'id'> = {
      ...formData,
      area: Number(formData.area),
      photoUrl: 'https://picsum.photos/seed/new-property/600/400',
      photoHint: 'new property',
      taxes: [...currentYearTaxes, ...previousYearTaxes], // Combine current and previous year taxes
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
    <div className="card-premium rounded-2xl shadow-xl p-6 md:p-10 border-2 border-border/50 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-primary">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <PlusCircle className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Register New Property
          </h2>
          <p className="text-lg text-muted-foreground mt-1">नया संपत्ति पंजीकरण</p>
        </div>
        {/* Current Financial Year Badge */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border-2 border-primary/30">
            <p className="text-xs font-semibold text-muted-foreground">Current Financial Year</p>
            <p className="text-2xl font-bold text-primary">{currentFY}</p>
          </div>
        </div>
      </div>
      
      {/* Mobile FY Badge */}
      <div className="md:hidden mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Current Financial Year • वर्तमान वित्तीय वर्ष</p>
        <p className="text-3xl font-bold text-primary mt-1">{currentFY}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/90">Full Name • पूरा नाम *</Label>
              <Input 
                type="text" 
                name="ownerName" 
                value={formData.ownerName} 
                onChange={handleInputChange} 
                placeholder="Enter full name" 
                required 
                className="h-12 border-2 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/90">Father's/Husband's Name • पिता/पति का नाम *</Label>
              <Input 
                type="text" 
                name="fatherName" 
                value={formData.fatherName} 
                onChange={handleInputChange} 
                placeholder="Enter father's/husband's name" 
                required 
                className="h-12 border-2 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-bold text-foreground/90">Mobile Number • मोबाइल नंबर *</Label>
              <Input 
                type="tel" 
                name="mobileNumber" 
                value={formData.mobileNumber} 
                onChange={handleInputChange} 
                placeholder="10-digit mobile number" 
                pattern="[0-9]{10}" 
                maxLength={10} 
                required 
                className="h-12 border-2 transition-all shadow-sm hover:shadow-md"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                Enter a 10-digit mobile number without country code.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaarHash" className="text-sm font-bold text-foreground/90">Aadhar Number • आधार नंबर</Label>
              <Input 
                type="tel" 
                name="aadhaarHash" 
                value={formData.aadhaarHash} 
                onChange={handleInputChange} 
                placeholder="12-digit Aadhar number" 
                pattern="[0-9]{12}" 
                maxLength={12} 
                className="h-12 border-2 transition-all shadow-sm hover:shadow-md"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                Enter 12-digit Aadhar number without spaces.
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-bold text-foreground/90">Address • पता *</Label>
              <Textarea 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                placeholder="Complete address" 
                rows={3} 
                maxLength={200} 
                required 
                className="border-2 transition-all resize-none shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/90">House/Property Number • संपत्ति नंबर *</Label>
              <Input 
                type="text" 
                name="houseNo" 
                value={formData.houseNo} 
                onChange={handleInputChange} 
                placeholder="e.g., Plot-101" 
                required 
                className="h-12 border-2 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/90">Property Type • संपत्ति का प्रकार *</Label>
              <Select name="propertyType" value={formData.propertyType} onValueChange={handleSelectChange} required>
                <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Residential">🏠 Residential - आवासीय</SelectItem>
                    <SelectItem value="Commercial">🏢 Commercial - व्यावसायिक</SelectItem>
                    <SelectItem value="Agricultural">🌾 Agricultural - कृषि</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/90">Area (sq. ft) • क्षेत्रफल</Label>
                <Input 
                  type="number" 
                  name="area" 
                  value={formData.area} 
                  onChange={handleInputChange} 
                  placeholder="Area in square feet" 
                  className="h-12 border-2 transition-all shadow-sm hover:shadow-md" 
                />
            </div>
        </div>

        <div className="space-y-6 pt-8 border-t-2 border-gradient-primary mt-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center border-2 border-success/30">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold text-foreground">Tax Assessment</h3>
              <p className="text-sm text-muted-foreground">कर मूल्यांकन</p>
            </div>
          </div>
          {taxes.map((tax, index) => (
            <div 
              key={index} 
              className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end p-5 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border-2 border-border/50 shadow-sm hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/90">Tax Type</Label>
                 <Select name="taxType" value={tax.taxType} onValueChange={(value: TaxRecord['taxType']) => handleTaxTypeChange(index, value)}>
                    <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                      <SelectValue placeholder="Select Tax Type" />
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
                <Label className="text-sm font-bold text-foreground/90">Annual Amount (₹)</Label>
                <Input 
                  type="number" 
                  name="assessedAmount" 
                  value={tax.assessedAmount} 
                  onChange={(e) => handleTaxChange(index, e)} 
                  placeholder="Amount in ₹" 
                  required 
                  min="0" 
                  className="h-12 border-2 transition-all shadow-sm hover:shadow-md font-semibold"
                />
              </div>
              <div className="flex items-end justify-end">
                {taxes.length > 1 && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => removeTaxField(index)} 
                    className="h-12 w-12 shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={addTaxField} 
            className="flex items-center gap-2 h-12 px-6 border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            Add Another Tax • एक और कर जोड़ें
          </Button>
        </div>

        {/* Previous Year Pending Amounts Section (Migration Support) */}
        <div className="space-y-6 pt-8 border-t-2 border-gradient-primary mt-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border-2 border-orange-500/30">
              <span className="text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-headline font-bold text-foreground">Previous Year Pending Amounts</h3>
              <p className="text-sm text-muted-foreground">पिछले वर्ष की बकाया राशि • For migrating from manual records</p>
            </div>
          </div>
          
          {previousPendingAmounts.length === 0 && (
            <div className="p-6 bg-muted/30 rounded-xl border-2 border-dashed border-border text-center">
              <p className="text-muted-foreground">No previous pending amounts added yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Previous Year Amount" to enter unpaid taxes from manual records.</p>
            </div>
          )}
          
          {previousPendingAmounts.map((prev, index) => (
            <div 
              key={index} 
              className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end p-5 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 rounded-xl border-2 border-orange-200/50 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/90">Financial Year • वित्तीय वर्ष</Label>
                <Select 
                  value={prev.financialYear} 
                  onValueChange={(value) => handlePreviousPendingChange(index, 'financialYear', value)}
                >
                  <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Select FY" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatePreviousFYs().map((fy) => (
                      <SelectItem key={fy} value={fy}>
                        FY {fy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/90">Tax Type • कर प्रकार</Label>
                <Select 
                  value={prev.taxType} 
                  onValueChange={(value: TaxRecord['taxType']) => handlePreviousPendingChange(index, 'taxType', value)}
                >
                  <SelectTrigger className="h-12 border-2 shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Select Tax Type" />
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
                <Label className="text-sm font-bold text-foreground/90">Pending Amount (₹) • बकाया राशि</Label>
                <Input 
                  type="number" 
                  value={prev.amount} 
                  onChange={(e) => handlePreviousPendingChange(index, 'amount', parseFloat(e.target.value) || 0)} 
                  placeholder="Amount in ₹" 
                  min="0" 
                  required
                  className="h-12 border-2 transition-all shadow-sm hover:shadow-md font-semibold"
                />
              </div>
              
              <div className="flex items-end justify-end">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removePreviousPendingAmount(index)} 
                  className="h-12 w-12 shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  <MinusCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addPreviousPendingAmount} 
            className="flex items-center gap-2 h-12 px-6 border-2 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-500 font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            Add Previous Year Amount • पिछले वर्ष की राशि जोड़ें
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-border">
          <Button
            type="submit"
            disabled={loading}
            variant="success"
            className="flex-1 h-14 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span>Save & Register • सहेजें और पंजीकृत करें</span>
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-8 h-14 border-2 rounded-xl font-bold text-lg hover:bg-muted/50 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            Cancel • रद्द करें
          </Button>
        </div>
      </form>
    </div>
  );
}
