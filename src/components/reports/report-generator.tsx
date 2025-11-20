'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateFinancialYearReport, generateCustomDateReport, TaxRecord } from '@/lib/excel-generator';
import { useToast } from '@/hooks/use-toast';

export function ReportGenerator() {
  const [reportType, setReportType] = useState<'financial-year' | 'custom-date'>('financial-year');
  const [financialYear, setFinancialYear] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [propertyType, setPropertyType] = useState('all');
  const [location, setLocation] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate financial years (current and previous 5 years)
  const currentYear = new Date().getFullYear();
  const financialYears = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${(year + 1).toString().slice(-2)}`;
  });

  const handleGenerateReport = async () => {
    setLoading(true);

    try {
      // Fetch data from Firestore
      const records = await fetchTaxRecords();

      // Filter records based on selected criteria
      let filteredRecords = filterRecords(records);

      if (filteredRecords.length === 0) {
        toast({
          title: 'कोई डेटा नहीं मिला',
          description: 'चयनित मानदंड के लिए कोई रिकॉर्ड नहीं मिला।',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Generate report based on type
      let fileName;
      if (reportType === 'financial-year') {
        if (!financialYear) {
          toast({
            title: 'वित्तीय वर्ष चुनें',
            description: 'कृपया एक वित्तीय वर्ष चुनें।',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        fileName = generateFinancialYearReport(filteredRecords, financialYear);
      } else {
        if (!startDate || !endDate) {
          toast({
            title: 'तिथियां चुनें',
            description: 'कृपया प्रारंभ और समाप्ति तिथि चुनें।',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        fileName = generateCustomDateReport(filteredRecords, startDate, endDate);
      }

      toast({
        title: 'रिपोर्ट जनरेट हुई',
        description: `${fileName} सफलतापूर्वक डाउनलोड हो गई है।`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'त्रुटि',
        description: 'रिपोर्ट जनरेट करने में त्रुटि हुई।',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxRecords = async (): Promise<TaxRecord[]> => {
    // Fetch data from Firestore
    const { collection, getDocs } = await import('firebase/firestore');
    const { initializeFirebase } = await import('@/firebase');
    const { firestore } = initializeFirebase();

    const propertiesSnapshot = await getDocs(collection(firestore, 'properties'));
    const taxesSnapshot = await getDocs(collection(firestore, 'taxes'));

    const properties = new Map();
    propertiesSnapshot.forEach(doc => {
      properties.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const records: TaxRecord[] = [];
    taxesSnapshot.forEach(doc => {
      const tax = doc.data();
      const property = properties.get(tax.propertyId);
      
      if (property) {
        records.push({
          propertyId: property.propertyId || property.id,
          ownerName: property.ownerName,
          fatherName: property.fatherName,
          mobileNumber: property.mobileNumber,
          address: property.address,
          propertyType: property.propertyType,
          area: property.area,
          location: property.location,
          taxType: tax.taxType,
          assessmentYear: tax.assessmentYear,
          baseAmount: tax.baseAmount,
          status: tax.status,
          totalAmount: tax.totalAmount,
          amountPaid: tax.amountPaid || 0,
          balanceDue: tax.balanceDue || tax.totalAmount,
          paymentDate: tax.paymentDate ? new Date(tax.paymentDate.seconds * 1000).toLocaleDateString('en-IN') : undefined
        });
      }
    });

    return records;
  };

  const filterRecords = (records: TaxRecord[]): TaxRecord[] => {
    let filtered = records;

    // Filter by report type
    if (reportType === 'financial-year' && financialYear) {
      filtered = filtered.filter(r => r.assessmentYear === financialYear);
    } else if (reportType === 'custom-date' && startDate && endDate) {
      filtered = filtered.filter(r => {
        if (!r.paymentDate) return false;
        const payDate = new Date(r.paymentDate);
        return payDate >= startDate && payDate <= endDate;
      });
    }

    // Filter by property type
    if (propertyType !== 'all') {
      filtered = filtered.filter(r => r.propertyType === propertyType);
    }

    // Filter by location
    if (location !== 'all') {
      filtered = filtered.filter(r => r.location === location);
    }

    // Filter by payment status
    if (paymentStatus !== 'all') {
      filtered = filtered.filter(r => r.status === paymentStatus);
    }

    return filtered;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            रिपोर्ट जनरेटर / Report Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            वित्तीय वर्ष या कस्टम तिथि सीमा के आधार पर Excel रिपोर्ट जनरेट करें
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>रिपोर्ट प्रकार / Report Type</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={reportType === 'financial-year' ? 'default' : 'outline'}
              onClick={() => setReportType('financial-year')}
              className="flex-1"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              वित्तीय वर्ष / Financial Year
            </Button>
            <Button
              type="button"
              variant={reportType === 'custom-date' ? 'default' : 'outline'}
              onClick={() => setReportType('custom-date')}
              className="flex-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              कस्टम तिथि / Custom Date
            </Button>
          </div>
        </div>

        {/* Financial Year Selection */}
        {reportType === 'financial-year' && (
          <div className="space-y-2">
            <Label htmlFor="financial-year">
              वित्तीय वर्ष चुनें / Select Financial Year *
            </Label>
            <Select value={financialYear} onValueChange={setFinancialYear}>
              <SelectTrigger id="financial-year">
                <SelectValue placeholder="वित्तीय वर्ष चुनें..." />
              </SelectTrigger>
              <SelectContent>
                {financialYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Date Selection */}
        {reportType === 'custom-date' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>प्रारंभ तिथि / Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>तिथि चुनें</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>समाप्ति तिथि / End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>तिथि चुनें</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-type">
              संपत्ति प्रकार / Property Type
            </Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="property-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">सभी / All</SelectItem>
                <SelectItem value="Residential">आवासीय / Residential</SelectItem>
                <SelectItem value="Commercial">वाणिज्यिक / Commercial</SelectItem>
                <SelectItem value="Industrial">औद्योगिक / Industrial</SelectItem>
                <SelectItem value="Agricultural">कृषि / Agricultural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">स्थान / Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">सभी / All</SelectItem>
                <SelectItem value="Urban">शहरी / Urban</SelectItem>
                <SelectItem value="Semi-Urban">अर्ध-शहरी / Semi-Urban</SelectItem>
                <SelectItem value="Rural">ग्रामीण / Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-status">
              भुगतान स्थिति / Payment Status
            </Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger id="payment-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">सभी / All</SelectItem>
                <SelectItem value="Paid">भुगतान / Paid</SelectItem>
                <SelectItem value="Partial">आंशिक / Partial</SelectItem>
                <SelectItem value="Pending">लंबित / Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <span className="mr-2">जनरेट हो रहा है...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Excel रिपोर्ट डाउनलोड करें
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            📊 रिपोर्ट में क्या शामिल है?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• सभी संपत्तियों का पूर्ण विवरण</li>
            <li>• सभी कर प्रकार (संपत्ति, जल, स्वच्छता, प्रकाश)</li>
            <li>• भुगतान स्थिति और तिथियां</li>
            <li>• कुल राशि, भुगतान राशि और शेष बकाया</li>
            <li>• सारांश शीट कर-वार विभाजन के साथ</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
