/**
 * Tax Rates Form Component
 * 
 * Form fields for tax configuration:
 * - Property Tax Rate (%)
 * - Water Tax (Flat Rate ₹)
 * - Late Fee (%)
 */

'use client';

import type { PanchayatSettings } from '@/lib/types';

interface TaxRatesFormProps {
  settings: Partial<PanchayatSettings>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Tax rate configuration form
 */
export function TaxRatesForm({ settings, onChange }: TaxRatesFormProps) {
  return (
    <div className="border-b pb-6">
      <h3 className="text-xl font-bold text-foreground mb-5">
        Tax Configuration • कर विन्यास
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Property Tax Rate (%)
          </label>
          <input
            type="number"
            name="propertyTaxRate"
            value={settings.propertyTaxRate || 0}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Water Tax (Flat Rate ₹)
          </label>
          <input
            type="number"
            name="waterTaxRate"
            value={settings.waterTaxRate || 0}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Late Fee (%)
          </label>
          <input
            type="number"
            name="lateFee"
            value={settings.lateFee || 0}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
