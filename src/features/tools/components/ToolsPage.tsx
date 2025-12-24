/**
 * Tools Page Component
 * 
 * Collection of utility tools for property tax management:
 * - Tax Calculator
 * - Property Valuation
 * - Bulk Operations
 * - Data Import/Export
 * - Payment Tracker
 */

'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, Upload, Download, Calendar, DollarSign, FileSpreadsheet, Search } from 'lucide-react';
import type { Property, PanchayatSettings } from '@/lib/types';

interface ToolsPageProps {
  properties: Property[];
  settings: PanchayatSettings | null;
}

export function ToolsPage({ properties, settings }: ToolsPageProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'tax-calculator',
      name: 'Tax Calculator',
      nameHi: 'कर कैलकुलेटर',
      description: 'Calculate property tax based on area and type',
      descriptionHi: 'क्षेत्र और प्रकार के आधार पर संपत्ति कर की गणना करें',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'property-valuation',
      name: 'Property Valuation',
      nameHi: 'संपत्ति मूल्यांकन',
      description: 'Estimate property value based on market rates',
      descriptionHi: 'बाजार दरों के आधार पर संपत्ति मूल्य का अनुमान लगाएं',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'payment-tracker',
      name: 'Payment Tracker',
      nameHi: 'भुगतान ट्रैकर',
      description: 'Track and analyze payment patterns',
      descriptionHi: 'भुगतान पैटर्न को ट्रैक और विश्लेषण करें',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'due-date-checker',
      name: 'Due Date Checker',
      nameHi: 'नियत तारीख जाँचकर्ता',
      description: 'Check upcoming payment due dates',
      descriptionHi: 'आगामी भुगतान की नियत तारीखों की जाँच करें',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'bulk-operations',
      name: 'Bulk Operations',
      nameHi: 'थोक संचालन',
      description: 'Perform operations on multiple properties',
      descriptionHi: 'कई संपत्तियों पर संचालन करें',
      icon: FileSpreadsheet,
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'data-export',
      name: 'Data Export',
      nameHi: 'डेटा निर्यात',
      description: 'Export data to Excel or CSV format',
      descriptionHi: 'एक्सेल या CSV प्रारूप में डेटा निर्यात करें',
      icon: Download,
      color: 'from-teal-500 to-teal-600',
    },
    {
      id: 'data-import',
      name: 'Data Import',
      nameHi: 'डेटा आयात',
      description: 'Import properties from Excel/CSV',
      descriptionHi: 'एक्सेल/CSV से संपत्तियों को आयात करें',
      icon: Upload,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      id: 'property-search',
      name: 'Advanced Search',
      nameHi: 'उन्नत खोज',
      description: 'Search properties with advanced filters',
      descriptionHi: 'उन्नत फ़िल्टर के साथ संपत्तियों की खोज करें',
      icon: Search,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-premium rounded-2xl shadow-xl p-6 border-2 border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Utility Tools
            </h2>
            <p className="text-lg text-muted-foreground mt-1">उपयोगी उपकरण</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="card-premium rounded-xl p-6 border-2 border-border/50 hover:border-primary/30 hover:shadow-xl transition-all text-left group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{tool.nameHi}</p>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {/* Tool Content Area */}
      {activeTool && (
        <div className="card-premium rounded-2xl shadow-xl p-8 border-2 border-primary/20 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              {tools.find(t => t.id === activeTool)?.name}
            </h3>
            <button
              onClick={() => setActiveTool(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Render tool content based on activeTool */}
          {activeTool === 'tax-calculator' && (
            <TaxCalculatorTool settings={settings} />
          )}
          {activeTool === 'property-valuation' && (
            <PropertyValuationTool settings={settings} />
          )}
          {activeTool === 'payment-tracker' && (
            <PaymentTrackerTool properties={properties} />
          )}
          {activeTool === 'due-date-checker' && (
            <DueDateCheckerTool properties={properties} />
          )}
          {activeTool === 'bulk-operations' && (
            <BulkOperationsTool properties={properties} />
          )}
          {activeTool === 'data-export' && (
            <DataExportTool properties={properties} />
          )}
          {activeTool === 'data-import' && (
            <DataImportTool />
          )}
          {activeTool === 'property-search' && (
            <AdvancedSearchTool properties={properties} />
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium rounded-xl p-4 border-2 border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Total Properties</div>
          <div className="text-3xl font-bold text-foreground">{properties.length}</div>
        </div>
        <div className="card-premium rounded-xl p-4 border-2 border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Tools Available</div>
          <div className="text-3xl font-bold text-primary">{tools.length}</div>
        </div>
        <div className="card-premium rounded-xl p-4 border-2 border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Active Users</div>
          <div className="text-3xl font-bold text-success">1</div>
        </div>
        <div className="card-premium rounded-xl p-4 border-2 border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Data Updated</div>
          <div className="text-sm font-semibold text-foreground">Just now</div>
        </div>
      </div>
    </div>
  );
}

// Individual Tool Components

function TaxCalculatorTool({ settings }: { settings: PanchayatSettings | null }) {
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Industrial' | 'Agricultural'>('Residential');
  const [locationType, setLocationType] = useState<'urban' | 'semiUrban' | 'rural'>('semiUrban');
  const [agriculturalType, setAgriculturalType] = useState<'irrigated' | 'unirrigated'>('unirrigated');
  const [includeWaterTax, setIncludeWaterTax] = useState(true);
  const [includeSanitationTax, setIncludeSanitationTax] = useState(true);
  const [includeLightingTax, setIncludeLightingTax] = useState(true);
  const [taxBreakdown, setTaxBreakdown] = useState<any | null>(null);

  const calculateTax = () => {
    if (!area) return;
    
    const areaNum = parseFloat(area);
    
    // Use MP Tax Calculator
    const { calculateComprehensiveTax } = require('@/lib/mp-tax-calculator');
    
    const result = calculateComprehensiveTax({
      propertyType,
      locationType,
      area: areaNum,
      agriculturalType: propertyType === 'Agricultural' ? agriculturalType : undefined,
      includeWaterTax,
      includeSanitationTax,
      includeLightingTax,
    });
    
    setTaxBreakdown(result);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
        <h4 className="font-bold text-sm mb-2">📋 MP Panchayat Tax Calculator</h4>
        <p className="text-xs text-muted-foreground">Based on Madhya Pradesh Panchayat Raj Act & Government guidelines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            {propertyType === 'Agricultural' ? 'Area (Acres)' : 'Area (sq ft)'}
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={propertyType === 'Agricultural' ? 'Enter acres' : 'Enter sq ft'}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as any)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="Residential">Residential (आवासीय)</option>
            <option value="Commercial">Commercial (व्यावसायिक)</option>
            <option value="Industrial">Industrial (औद्योगिक)</option>
            <option value="Agricultural">Agricultural (कृषि)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Location Type</label>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as any)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="urban">Urban (शहरी)</option>
            <option value="semiUrban">Semi-Urban (अर्ध-शहरी)</option>
            <option value="rural">Rural (ग्रामीण)</option>
          </select>
        </div>
        {propertyType === 'Agricultural' && (
          <div>
            <label className="block text-sm font-semibold mb-2">Agricultural Type</label>
            <select
              value={agriculturalType}
              onChange={(e) => setAgriculturalType(e.target.value as any)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="irrigated">Irrigated (सिंचित)</option>
              <option value="unirrigated">Unirrigated (असिंचित)</option>
            </select>
          </div>
        )}
      </div>

      {propertyType !== 'Agricultural' && (
        <div className="border-2 rounded-xl p-4">
          <label className="block text-sm font-semibold mb-3">Additional Taxes (वार्षिक कर)</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWaterTax}
                onChange={(e) => setIncludeWaterTax(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Water Tax (जल कर)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSanitationTax}
                onChange={(e) => setIncludeSanitationTax(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Sanitation Tax (स्वच्छता कर)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLightingTax}
                onChange={(e) => setIncludeLightingTax(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Lighting Tax (प्रकाश कर)</span>
            </label>
          </div>
        </div>
      )}
      
      <button
        onClick={calculateTax}
        className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
      >
        Calculate Tax • कर की गणना करें
      </button>

      {taxBreakdown && (
        <div className="space-y-4 animate-slide-up">
          {/* Tax Breakdown */}
          <div className="border-2 border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold">Tax Breakdown • कर विवरण</h4>
            {taxBreakdown.breakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.name} ({item.nameHi})</span>
                <span className="font-semibold">Rs. {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="border-t-2 pt-2 flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>Rs. {taxBreakdown.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {taxBreakdown.rebate > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Early Payment Rebate (5%)</span>
                <span>- Rs. {taxBreakdown.rebate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-success/10 to-emerald-500/10 border-2 border-success/30 rounded-xl p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Total Annual Tax • कुल वार्षिक कर</div>
            <div className="text-4xl font-bold text-success">
              Rs. {taxBreakdown.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Pay before March 31st for 5% rebate
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyValuationTool({ settings }: { settings: PanchayatSettings | null }) {
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('Semi-Urban');
  const [propertyType, setPropertyType] = useState('Residential');
  const [valuation, setValuation] = useState<number | null>(null);

  const calculateValuation = () => {
    const areaNum = parseFloat(area);
    
    // MP market rates (approximate circle rates 2024-25)
    const rates: Record<string, Record<string, number>> = {
      Residential: {
        Urban: 4500,      // ₹4,500/sq ft
        'Semi-Urban': 2800, // ₹2,800/sq ft
        Rural: 1500,      // ₹1,500/sq ft
      },
      Commercial: {
        Urban: 8000,      // ₹8,000/sq ft
        'Semi-Urban': 5500, // ₹5,500/sq ft
        Rural: 3000,      // ₹3,000/sq ft
      },
      Industrial: {
        Urban: 6500,      // ₹6,500/sq ft
        'Semi-Urban': 4000, // ₹4,000/sq ft
        Rural: 2500,      // ₹2,500/sq ft
      },
    };
    
    const rate = rates[propertyType]?.[location] || 2000;
    setValuation(areaNum * rate);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
        <h4 className="font-bold text-sm mb-2">📊 MP Circle Rate Valuation</h4>
        <p className="text-xs text-muted-foreground">Approximate market rates based on MP circle rates 2024-25</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Property Area (sq ft)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Enter area"
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="Residential">Residential (आवासीय)</option>
            <option value="Commercial">Commercial (व्यावसायिक)</option>
            <option value="Industrial">Industrial (औद्योगिक)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Location Type</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="Urban">Urban - शहरी क्षेत्र</option>
          <option value="Semi-Urban">Semi-Urban - अर्ध-शहरी क्षेत्र</option>
          <option value="Rural">Rural - ग्रामीण क्षेत्र</option>
        </select>
      </div>
      
      <button
        onClick={calculateValuation}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
      >
        Calculate Valuation • मूल्यांकन करें
      </button>

      {valuation !== null && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-6 text-center animate-slide-up">
          <div className="text-sm text-muted-foreground mb-2">Estimated Property Value • अनुमानित मूल्य</div>
          <div className="text-4xl font-bold text-green-600">
            Rs. {valuation.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground mt-3">
            Based on MP circle rates • MP सर्कल दर के आधार पर
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentTrackerTool({ properties }: { properties: Property[] }) {
  const paidCount = properties.filter(p => 
    p.taxes?.some(t => t.paymentStatus === 'Paid')
  ).length;
  
  const unpaidCount = properties.filter(p => 
    p.taxes?.some(t => t.paymentStatus === 'Unpaid')
  ).length;

  const partialCount = properties.filter(p => 
    p.taxes?.some(t => t.paymentStatus === 'Partial')
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 rounded-xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Paid</div>
          <div className="text-3xl font-bold text-success">{paidCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Properties fully paid</div>
        </div>
        <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Unpaid</div>
          <div className="text-3xl font-bold text-destructive">{unpaidCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Properties pending payment</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 rounded-xl p-6">
          <div className="text-sm text-muted-foreground mb-2">Partial</div>
          <div className="text-3xl font-bold text-warning">{partialCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Properties partially paid</div>
        </div>
      </div>
    </div>
  );
}

function DueDateCheckerTool({ properties }: { properties: Property[] }) {
  const today = new Date();
  // Check for unpaid/partial taxes from current and previous years
  const currentYear = today.getFullYear();
  const overdue = properties.filter(p => 
    p.taxes?.some(t => {
      if (t.paymentStatus === 'Paid') return false;
      // Tax is overdue if it's from previous years and not paid
      return t.assessmentYear < currentYear;
    })
  );

  const totalOverdue = overdue.reduce((sum, p) => {
    const unpaidAmount = p.taxes
      ?.filter(t => t.paymentStatus !== 'Paid' && t.assessmentYear < currentYear)
      .reduce((taxSum, t) => taxSum + (t.assessedAmount - t.amountPaid), 0) || 0;
    return sum + unpaidAmount;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-destructive/10 to-red-500/5 border-2 border-destructive/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-destructive" />
          <div>
            <h4 className="font-bold text-lg">Overdue Payments • अधिक देय भुगतान</h4>
            <p className="text-sm text-muted-foreground">Properties with previous year taxes unpaid</p>
          </div>
        </div>
        <div className="text-4xl font-bold text-destructive mb-2">{overdue.length}</div>
        <div className="text-sm text-muted-foreground mb-3">
          {overdue.length > 0 ? 'Immediate action required • तुरंत कार्रवाई आवश्यक' : 'All payments up to date • सभी भुगतान अद्यतन'}
        </div>
        {totalOverdue > 0 && (
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-destructive/20">
            <div className="text-xs text-muted-foreground mb-1">Total Overdue Amount</div>
            <div className="text-2xl font-bold text-destructive">
              Rs. {totalOverdue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BulkOperationsTool({ properties }: { properties: Property[] }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Bulk operations coming soon. This will allow you to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
        <li>Generate bills for multiple properties at once</li>
        <li>Update tax rates across properties</li>
        <li>Send payment reminders in bulk</li>
        <li>Mark multiple payments as received</li>
      </ul>
    </div>
  );
}

function DataExportTool({ properties }: { properties: Property[] }) {
  const exportToCSV = () => {
    const headers = ['Property ID', 'Owner Name', 'Address', 'Property Type', 'Area', 'Tax Status'];
    const rows = properties.map(p => [
      p.id,
      p.ownerName,
      p.address,
      p.propertyType,
      p.area,
      p.taxes?.[0]?.paymentStatus || 'N/A'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Export your property data to CSV format for analysis in Excel or other tools.
      </p>
      <button
        onClick={exportToCSV}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Export to CSV ({properties.length} properties)
      </button>
    </div>
  );
}

function DataImportTool() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Import properties from CSV or Excel file. Coming soon.
      </p>
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Drop CSV or Excel file here</p>
      </div>
    </div>
  );
}

function AdvancedSearchTool({ properties }: { properties: Property[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const filtered = properties.filter(p => {
    const matchesSearch = p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || p.propertyType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or ID..."
          className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="All">All Types</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
          <option value="Agricultural">Agricultural</option>
        </select>
      </div>
      <div className="text-sm text-muted-foreground">
        Found {filtered.length} properties
      </div>
    </div>
  );
}
