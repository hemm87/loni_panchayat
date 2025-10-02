import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to map tax types to Hindi names
export function getTaxHindiName(taxType: string): string {
  const mapping: Record<string, string> = {
    'Property Tax': 'संपत्ति कर',
    'Water Tax': 'जल कर',
    'Sanitation Tax': 'स्वच्छता कर',
    'Lighting Tax': 'प्रकाश कर',
    'Land Tax': 'भूमि कर',
    'Business Tax': 'व्यापार कर',
    'Other': 'अन्य',
  };
  return mapping[taxType] || '';
}

    