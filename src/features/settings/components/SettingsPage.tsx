/**
 * Settings Page Component
 * 
 * Main settings container with:
 * - Panchayat information form
 * - Tax configuration form
 * - User management section
 * - Save/Reset functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PanchayatInfoForm } from './PanchayatInfoForm';
import { TaxRatesForm } from './TaxRatesForm';
import { UserRoleDisplay } from '@/components/ui/user-role-display';
import type { PanchayatSettings } from '@/lib/types';

interface SettingsPageProps {
  settings: PanchayatSettings | null;
  docRef: any;
}

/**
 * Main settings page container
 */
export function SettingsPage({ settings, docRef }: SettingsPageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState<Partial<PanchayatSettings>>({
    panchayatName: 'Loni Gram Panchayat',
    district: '',
    state: '',
    pinCode: '',
    propertyTaxRate: 0,
    waterTaxRate: 0,
    lateFee: 0,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!docRef) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Firestore not configured correctly.' 
      });
      return;
    }
    setLoading(true);
    try {
      await setDoc(docRef, localSettings, { merge: true });
      toast({ 
        title: 'Success', 
        description: 'Settings saved successfully.' 
      });
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-border/50">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Settings
            </h2>
            <p className="text-muted-foreground">सेटिंग्स</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Panchayat Information */}
          <PanchayatInfoForm
            settings={localSettings}
            onChange={handleInputChange}
          />

          {/* Tax Configuration */}
          <TaxRatesForm
            settings={localSettings}
            onChange={handleInputChange}
          />

          {/* User Management & Permissions */}
          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              User Management & Permissions • उपयोगकर्ता प्रबंधन और अनुमतियाँ
            </h3>
            <UserRoleDisplay />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              Save Settings • सेटिंग्स सहेजें
            </button>
            <button 
              onClick={() => setLocalSettings(settings || {})}
              disabled={loading}
              className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all"
            >
              Reset • रीसेट करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
