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
  const [propertyType, setPropertyType] = useState('Residential');
  const [taxAmount, setTaxAmount] = useState<number | null>(null);

  const calculateTax = () => {
    if (!settings || !area) return;
    
    const areaNum = parseFloat(area);
    let rate = settings.propertyTaxRate || 0;
    
    // Adjust rate based on property type
    if (propertyType === 'Commercial') rate *= 1.5;
    if (propertyType === 'Industrial') rate *= 2;
    
    const tax = areaNum * rate;
    setTaxAmount(tax);
  };

  return (
    <div className="space-y-4">
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
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Agricultural">Agricultural</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={calculateTax}
        className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
      >
        Calculate Tax
      </button>

      {taxAmount !== null && (
        <div className="bg-gradient-to-r from-success/10 to-emerald-500/10 border-2 border-success/30 rounded-xl p-6 text-center animate-slide-up">
          <div className="text-sm text-muted-foreground mb-2">Estimated Annual Tax</div>
          <div className="text-4xl font-bold text-success">
            ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Based on {area} sq ft @ {settings?.propertyTaxRate || 0}% base rate
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyValuationTool({ settings }: { settings: PanchayatSettings | null }) {
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('Urban');
  const [valuation, setValuation] = useState<number | null>(null);

  const calculateValuation = () => {
    const areaNum = parseFloat(area);
    let ratePerSqFt = 3000; // Base rate
    
    if (location === 'Urban') ratePerSqFt = 5000;
    if (location === 'Semi-Urban') ratePerSqFt = 3500;
    if (location === 'Rural') ratePerSqFt = 2000;
    
    setValuation(areaNum * ratePerSqFt);
  };

  return (
    <div className="space-y-4">
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
          <label className="block text-sm font-semibold mb-2">Location Type</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="Urban">Urban - ₹5,000/sq ft</option>
            <option value="Semi-Urban">Semi-Urban - ₹3,500/sq ft</option>
            <option value="Rural">Rural - ₹2,000/sq ft</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={calculateValuation}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
      >
        Calculate Valuation
      </button>

      {valuation !== null && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-6 text-center animate-slide-up">
          <div className="text-sm text-muted-foreground mb-2">Estimated Property Value</div>
          <div className="text-4xl font-bold text-green-600">
            ₹{valuation.toLocaleString('en-IN')}
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
  const overdue = properties.filter(p => 
    p.taxes?.some(t => {
      if (!t.dueDate || t.paymentStatus === 'Paid') return false;
      return new Date(t.dueDate) < today;
    })
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-destructive/10 to-red-500/5 border-2 border-destructive/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-destructive" />
          <div>
            <h4 className="font-bold text-lg">Overdue Payments</h4>
            <p className="text-sm text-muted-foreground">Properties past due date</p>
          </div>
        </div>
        <div className="text-4xl font-bold text-destructive mb-2">{overdue.length}</div>
        <div className="text-sm text-muted-foreground">
          {overdue.length > 0 ? 'Immediate action required' : 'All payments up to date'}
        </div>
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
