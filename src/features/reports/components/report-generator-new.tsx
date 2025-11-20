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
import { CalendarIcon, Download, FileSpreadsheet, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateFinancialYearReport, generateCustomDateReport, type TaxRecord } from '@/lib/excel-generator';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@/lib/types';

export function ReportGenerator() {
  const [reportType, setReportType] = useState<'financial-year' | 'custom-date'>('financial-year');
  const [financialYear, setFinancialYear] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [propertyType, setPropertyType] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<TaxRecord[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Generate financial years (current and previous 5 years)
  const currentYear = new Date().getFullYear();
  const financialYears = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${(year + 1).toString().slice(-2)}`;
  });

  const handlePreviewReport = async () => {
    setLoading(true);
    setShowPreview(false);

    try {
      // Validate inputs
      if (reportType === 'financial-year' && !financialYear) {
        toast({
          title: 'वित्तीय वर्ष चुनें',
          description: 'कृपया वित्तीय वर्ष चुनें',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (reportType === 'custom-date' && (!startDate || !endDate)) {
        toast({
          title: 'तिथियां चुनें',
          description: 'कृपया प्रारंभ और समाप्ति तिथि दोनों चुनें',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Fetch data from Firestore
      const records = await fetchTaxRecords();

      if (records.length === 0) {
        toast({
          title: 'कोई डेटा नहीं',
          description: 'डेटाबेस में कोई संपत्ति या कर नहीं मिला',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Filter records
      const filteredRecords = filterRecords(records);

      if (filteredRecords.length === 0) {
        toast({
          title: 'कोई मैच नहीं',
          description: 'आपके फ़िल्टर के अनुसार कोई रिकॉर्ड नहीं मिला',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setPreviewData(filteredRecords);
      setShowPreview(true);

      toast({
        title: 'प्रीव्यू तैयार है',
        description: `${filteredRecords.length} रिकॉर्ड मिले`,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: 'त्रुटि',
        description: error instanceof Error ? error.message : 'प्रीव्यू लोड नहीं हो सका',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!previewData || previewData.length === 0) {
      toast({
        title: 'कोई डेटा नहीं',
        description: 'पहले रिपोर्ट का प्रीव्यू देखें',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (reportType === 'financial-year') {
        await generateFinancialYearReport(previewData, financialYear);
      } else if (startDate && endDate) {
        await generateCustomDateReport(previewData, startDate, endDate);
      }

      toast({
        title: 'सफलता!',
        description: 'Excel रिपोर्ट डाउनलोड हो गई',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'त्रुटि',
        description: error instanceof Error ? error.message : 'डाउनलोड नहीं हो सका',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxRecords = async (): Promise<TaxRecord[]> => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { initializeFirebase } = await import('@/firebase');
      const { firestore } = initializeFirebase();

      console.log('Fetching properties from Firestore...');
      const propertiesSnapshot = await getDocs(collection(firestore, 'properties'));
      console.log(`Found ${propertiesSnapshot.size} properties`);

      const records: TaxRecord[] = [];

      propertiesSnapshot.forEach(doc => {
        const property = doc.data() as Property;
        
        // Process each tax for the property
        if (property.taxes && Array.isArray(property.taxes)) {
          property.taxes.forEach(tax => {
            records.push({
              propertyId: property.id || doc.id,
              ownerName: property.ownerName || '',
              fatherName: property.fatherName || '',
              mobileNumber: property.mobileNumber || '',
              address: property.address || '',
              propertyType: property.propertyType || 'Residential',
              area: property.area || 0,
              location: '', // Not in current schema
              taxType: tax.taxType || 'Property Tax',
              assessmentYear: tax.assessmentYear ? tax.assessmentYear.toString() : new Date().getFullYear().toString(),
              baseAmount: tax.baseAmount || tax.assessedAmount || 0,
              status: tax.paymentStatus || 'Pending',
              totalAmount: tax.assessedAmount || 0,
              amountPaid: tax.amountPaid || 0,
              balanceDue: (tax.assessedAmount || 0) - (tax.amountPaid || 0),
              paymentDate: tax.paymentDate || undefined
            });
          });
        }
      });

      console.log(`Generated ${records.length} tax records`);
      return records;
    } catch (error) {
      console.error('Firestore fetch error:', error);
      throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filterRecords = (records: TaxRecord[]): TaxRecord[] => {
    let filtered = records;

    // Filter by report type
    if (reportType === 'financial-year' && financialYear) {
      console.log(`Selected FY: ${financialYear}`);
      console.log(`Total records: ${records.length}`);
      console.log('ALL assessment years in data:', [...new Set(records.map(r => r.assessmentYear))]);
      
      // Parse financial year: "2025-26" → startYear=2025, endYear=2026
      const [startYear, endYearShort] = financialYear.split('-');
      const fyStartYear = parseInt(startYear);
      const fyEndYear = parseInt('20' + endYearShort);
      
      console.log(`Filtering for FY ${financialYear}: April ${fyStartYear} to March ${fyEndYear}`);
      
      filtered = filtered.filter(r => {
        // Assessment year is stored as number (e.g., 2025)
        // Match if assessmentYear equals start or end year
        const assessmentYear = typeof r.assessmentYear === 'number' 
          ? r.assessmentYear 
          : parseInt(r.assessmentYear.toString());
        
        const matchesAssessmentYear = assessmentYear === fyStartYear || assessmentYear === fyEndYear;
        
        // Also check payment date if available
        if (r.paymentDate) {
          try {
            const payDate = new Date(r.paymentDate);
            const payYear = payDate.getFullYear();
            const payMonth = payDate.getMonth() + 1;
            
            // FY 2025-26: April 2025 (month >= 4, year = 2025) to March 2026 (month <= 3, year = 2026)
            const inFyRange = (
              (payYear === fyStartYear && payMonth >= 4) ||
              (payYear === fyEndYear && payMonth <= 3)
            );
            
            return matchesAssessmentYear || inFyRange;
          } catch (e) {
            console.warn('Invalid payment date:', r.paymentDate);
            return matchesAssessmentYear;
          }
        }
        
        return matchesAssessmentYear;
      });
      
      console.log(`After FY filter: ${filtered.length} records from ${records.length} total`);
    } else if (reportType === 'custom-date' && startDate && endDate) {
      console.log(`Filtering by date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
      
      filtered = filtered.filter(r => {
        if (!r.paymentDate) {
          return false;
        }
        
        try {
          const payDate = new Date(r.paymentDate);
          if (isNaN(payDate.getTime())) {
            console.warn(`Invalid payment date:`, r.paymentDate);
            return false;
          }
          return payDate >= startDate && payDate <= endDate;
        } catch (e) {
          console.error(`Error parsing date:`, e);
          return false;
        }
      });
      
      console.log(`After date filter: ${filtered.length} records from ${records.length} total`);
    }

    // Filter by property type
    if (propertyType !== 'all') {
      filtered = filtered.filter(r => r.propertyType === propertyType);
    }

    // Filter by payment status
    if (paymentStatus !== 'all') {
      filtered = filtered.filter(r => r.status === paymentStatus);
    }

    return filtered;
  };

  const calculateSummary = () => {
    if (!previewData) return null;

    const total = previewData.reduce((sum, r) => sum + r.totalAmount, 0);
    const paid = previewData.reduce((sum, r) => sum + r.amountPaid, 0);
    const due = previewData.reduce((sum, r) => sum + r.balanceDue, 0);

    return { total, paid, due, count: previewData.length };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              रिपोर्ट जनरेटर / Report Generator
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              वित्तीय वर्ष या कस्टम तिथि के आधार पर Excel रिपोर्ट जनरेट करें
            </p>
          </div>

          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>रिपोर्ट प्रकार / Report Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={reportType === 'financial-year' ? 'default' : 'outline'}
                onClick={() => {
                  setReportType('financial-year');
                  setShowPreview(false);
                  setPreviewData(null);
                }}
                className="flex-1"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                वित्तीय वर्ष / Financial Year
              </Button>
              <Button
                type="button"
                variant={reportType === 'custom-date' ? 'default' : 'outline'}
                onClick={() => {
                  setReportType('custom-date');
                  setShowPreview(false);
                  setPreviewData(null);
                }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="Agricultural">कृषि / Agricultural</SelectItem>
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
                  <SelectItem value="Unpaid">अवैतनिक / Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handlePreviewReport}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <>
                  <span className="mr-2">लोड हो रहा है...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-5 w-5" />
                  प्रीव्यू देखें / Preview
                </>
              )}
            </Button>

            <Button
              onClick={handleDownloadReport}
              disabled={!previewData || loading}
              className="flex-1"
            >
              <Download className="mr-2 h-5 w-5" />
              Excel डाउनलोड करें / Download
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

      {/* Preview Section */}
      {showPreview && previewData && summary && (
        <Card className="p-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                रिपोर्ट प्रीव्यू / Report Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">कुल रिकॉर्ड</div>
                <div className="text-2xl font-bold text-blue-900">{summary.count}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">कुल राशि</div>
                <div className="text-2xl font-bold text-green-900">
                  ₹{summary.total.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-600 font-medium">भुगतान राशि</div>
                <div className="text-2xl font-bold text-emerald-900">
                  ₹{summary.paid.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">बकाया राशि</div>
                <div className="text-2xl font-bold text-red-900">
                  ₹{summary.due.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Data Table Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">क्रमांक</th>
                      <th className="px-4 py-2 text-left">मालिक का नाम</th>
                      <th className="px-4 py-2 text-left">संपत्ति ID</th>
                      <th className="px-4 py-2 text-left">कर प्रकार</th>
                      <th className="px-4 py-2 text-right">कुल राशि</th>
                      <th className="px-4 py-2 text-right">भुगतान</th>
                      <th className="px-4 py-2 text-left">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 50).map((record, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{record.ownerName}</td>
                        <td className="px-4 py-2">{record.propertyId}</td>
                        <td className="px-4 py-2">{record.taxType}</td>
                        <td className="px-4 py-2 text-right">
                          ₹{record.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ₹{record.amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            record.status === 'Paid' && "bg-green-100 text-green-800",
                            record.status === 'Partial' && "bg-yellow-100 text-yellow-800",
                            record.status === 'Unpaid' && "bg-red-100 text-red-800"
                          )}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 50 && (
                <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                  Showing first 50 of {previewData.length} records
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
