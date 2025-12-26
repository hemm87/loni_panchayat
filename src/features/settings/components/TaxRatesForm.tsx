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
  readOnly?: boolean;
}

/**
 * Tax rate configuration form
 */
export function TaxRatesForm({ settings, onChange, readOnly = false }: TaxRatesFormProps) {
  const inputClass = readOnly 
    ? "w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
    : "w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all";

  return (
    <div className="border-b pb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-foreground">
          Tax Configuration • कर विन्यास
        </h3>
        {readOnly && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            🔒 View Only • केवल देखें
          </span>
        )}
      </div>
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
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Water Tax (Flat Rate Rs.)
          </label>
          <input
            type="number"
            name="waterTaxRate"
            value={settings.waterTaxRate || 0}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            readOnly={readOnly}
            className={inputClass}
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
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
