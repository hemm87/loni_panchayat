/**
 * Panchayat Information Form Component
 * 
 * Form fields for basic panchayat details:
 * - Panchayat Name
 * - District
 * - State
 * - PIN Code
 */

'use client';

import type { PanchayatSettings } from '@/lib/types';

interface PanchayatInfoFormProps {
  settings: Partial<PanchayatSettings>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

/**
 * Panchayat information input form
 */
export function PanchayatInfoForm({ settings, onChange, readOnly = false }: PanchayatInfoFormProps) {
  const inputClass = readOnly 
    ? "w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
    : "w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all";

  return (
    <div className="border-b pb-6">
      <h3 className="text-xl font-bold text-foreground mb-5">
        Panchayat Information • पंचायत जानकारी
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Panchayat Name
          </label>
          <input
            type="text"
            name="panchayatName"
            value={settings.panchayatName || ''}
            onChange={onChange}
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            District • जिला
          </label>
          <input
            type="text"
            name="district"
            value={settings.district || ''}
            onChange={onChange}
            placeholder={readOnly ? '' : 'Enter district name'}
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            State • राज्य
          </label>
          <input
            type="text"
            name="state"
            value={settings.state || ''}
            onChange={onChange}
            placeholder={readOnly ? '' : 'Enter state name'}
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            PIN Code • पिन कोड
          </label>
          <input
            type="text"
            name="pinCode"
            value={settings.pinCode || ''}
            onChange={onChange}
            placeholder={readOnly ? '' : 'Enter PIN code'}
            readOnly={readOnly}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
