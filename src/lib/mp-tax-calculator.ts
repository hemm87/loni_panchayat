/**
 * Madhya Pradesh Panchayat Tax Calculation Logic
 * 
 * Based on MP Panchayat Raj Act and Government guidelines
 * Reference: MP Panchayat Raj & Rural Development Department
 */

export interface MPTaxRates {
  // Property Tax (per sq ft per year)
  residential: {
    urban: number;      // Urban areas
    semiUrban: number;  // Semi-urban areas
    rural: number;      // Rural areas
  };
  commercial: {
    urban: number;
    semiUrban: number;
    rural: number;
  };
  industrial: {
    urban: number;
    semiUrban: number;
    rural: number;
  };
  agricultural: {
    irrigated: number;   // Per acre
    unirrigated: number; // Per acre
  };
  
  // Other Taxes (Annual)
  waterTax: {
    residential: number; // Per connection
    commercial: number;
    industrial: number;
  };
  
  sanitationTax: {
    residential: number; // Per household
    commercial: number;
    industrial: number;
  };
  
  lightingTax: {
    residential: number; // Per household
    commercial: number;
    industrial: number;
  };
  
  // Additional charges
  lateFeePercentage: number; // Percentage per month
  rebatePercentage: number;  // Early payment rebate
  rebateDeadline: string;    // Format: 'MM-DD' (e.g., '03-31')
}

/**
 * MP Government Standard Tax Rates (2024-25)
 * These are typical rates - adjust based on your specific panchayat
 */
export const MP_PANCHAYAT_TAX_RATES: MPTaxRates = {
  residential: {
    urban: 3.0,      // ₹3 per sq ft per year
    semiUrban: 2.0,  // ₹2 per sq ft per year
    rural: 1.5,      // ₹1.50 per sq ft per year
  },
  commercial: {
    urban: 6.0,      // ₹6 per sq ft per year
    semiUrban: 4.5,  // ₹4.50 per sq ft per year
    rural: 3.5,      // ₹3.50 per sq ft per year
  },
  industrial: {
    urban: 8.0,      // ₹8 per sq ft per year
    semiUrban: 6.0,  // ₹6 per sq ft per year
    rural: 5.0,      // ₹5 per sq ft per year
  },
  agricultural: {
    irrigated: 200,    // ₹200 per acre per year
    unirrigated: 100,  // ₹100 per acre per year
  },
  
  waterTax: {
    residential: 600,   // ₹600 per year
    commercial: 1200,   // ₹1200 per year
    industrial: 2400,   // ₹2400 per year
  },
  
  sanitationTax: {
    residential: 300,   // ₹300 per year
    commercial: 600,    // ₹600 per year
    industrial: 1200,   // ₹1200 per year
  },
  
  lightingTax: {
    residential: 240,   // ₹240 per year (₹20/month)
    commercial: 480,    // ₹480 per year
    industrial: 960,    // ₹960 per year
  },
  
  lateFeePercentage: 1.5,  // 1.5% per month
  rebatePercentage: 5,     // 5% rebate if paid before deadline
  rebateDeadline: '03-31', // March 31st
};

export type LocationType = 'urban' | 'semiUrban' | 'rural';
export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type AgriculturalType = 'irrigated' | 'unirrigated';

export interface TaxCalculationInput {
  propertyType: PropertyCategory;
  locationType: LocationType;
  area: number; // sq ft for buildings, acres for agricultural
  agriculturalType?: AgriculturalType;
  includeWaterTax?: boolean;
  includeSanitationTax?: boolean;
  includeLightingTax?: boolean;
  assessmentDate?: Date;
}

export interface TaxBreakdown {
  propertyTax: number;
  waterTax: number;
  sanitationTax: number;
  lightingTax: number;
  subtotal: number;
  rebate: number;
  lateFee: number;
  totalTax: number;
  breakdown: Array<{
    name: string;
    nameHi: string;
    amount: number;
  }>;
}

/**
 * Calculate Property Tax based on MP Panchayat rules
 */
export function calculatePropertyTax(
  area: number,
  propertyType: PropertyCategory,
  locationType: LocationType,
  agriculturalType?: AgriculturalType
): number {
  const rates = MP_PANCHAYAT_TAX_RATES;
  
  if (propertyType === 'Agricultural') {
    const type = agriculturalType || 'unirrigated';
    return area * rates.agricultural[type];
  }
  
  const typeKey = propertyType.toLowerCase() as 'residential' | 'commercial' | 'industrial';
  const rate = rates[typeKey][locationType];
  
  return area * rate;
}

/**
 * Calculate Water Tax
 */
export function calculateWaterTax(propertyType: PropertyCategory): number {
  const rates = MP_PANCHAYAT_TAX_RATES.waterTax;
  
  switch (propertyType) {
    case 'Residential':
      return rates.residential;
    case 'Commercial':
      return rates.commercial;
    case 'Industrial':
      return rates.industrial;
    case 'Agricultural':
      return 0; // Agricultural properties typically don't have water tax
    default:
      return 0;
  }
}

/**
 * Calculate Sanitation Tax
 */
export function calculateSanitationTax(propertyType: PropertyCategory): number {
  const rates = MP_PANCHAYAT_TAX_RATES.sanitationTax;
  
  switch (propertyType) {
    case 'Residential':
      return rates.residential;
    case 'Commercial':
      return rates.commercial;
    case 'Industrial':
      return rates.industrial;
    case 'Agricultural':
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate Lighting Tax
 */
export function calculateLightingTax(propertyType: PropertyCategory): number {
  const rates = MP_PANCHAYAT_TAX_RATES.lightingTax;
  
  switch (propertyType) {
    case 'Residential':
      return rates.residential;
    case 'Commercial':
      return rates.commercial;
    case 'Industrial':
      return rates.industrial;
    case 'Agricultural':
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate Early Payment Rebate
 */
export function calculateRebate(subtotal: number, assessmentDate: Date): number {
  const currentYear = new Date().getFullYear();
  const [month, day] = MP_PANCHAYAT_TAX_RATES.rebateDeadline.split('-').map(Number);
  const deadlineDate = new Date(currentYear, month - 1, day);
  
  // If payment is before deadline, apply rebate
  if (assessmentDate <= deadlineDate) {
    return subtotal * (MP_PANCHAYAT_TAX_RATES.rebatePercentage / 100);
  }
  
  return 0;
}

/**
 * Calculate Late Fee
 */
export function calculateLateFee(
  subtotal: number,
  dueDate: Date,
  paymentDate: Date = new Date()
): number {
  if (paymentDate <= dueDate) {
    return 0;
  }
  
  // Calculate months overdue
  const monthsOverdue = Math.ceil(
    (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  const lateFeeRate = MP_PANCHAYAT_TAX_RATES.lateFeePercentage / 100;
  const lateFee = subtotal * lateFeeRate * monthsOverdue;
  
  // Cap late fee at 50% of subtotal
  return Math.min(lateFee, subtotal * 0.5);
}

/**
 * Comprehensive Tax Calculation
 */
export function calculateComprehensiveTax(input: TaxCalculationInput): TaxBreakdown {
  const {
    propertyType,
    locationType,
    area,
    agriculturalType,
    includeWaterTax = true,
    includeSanitationTax = true,
    includeLightingTax = true,
    assessmentDate = new Date(),
  } = input;
  
  // Calculate individual taxes
  const propertyTax = calculatePropertyTax(area, propertyType, locationType, agriculturalType);
  const waterTax = includeWaterTax ? calculateWaterTax(propertyType) : 0;
  const sanitationTax = includeSanitationTax ? calculateSanitationTax(propertyType) : 0;
  const lightingTax = includeLightingTax ? calculateLightingTax(propertyType) : 0;
  
  const subtotal = propertyTax + waterTax + sanitationTax + lightingTax;
  
  // Calculate rebate (if applicable)
  const rebate = calculateRebate(subtotal, assessmentDate);
  
  // Late fee is 0 at time of assessment (calculated later if payment is late)
  const lateFee = 0;
  
  const totalTax = subtotal - rebate + lateFee;
  
  // Create breakdown
  const breakdown = [
    {
      name: 'Property Tax',
      nameHi: 'संपत्ति कर',
      amount: propertyTax,
    },
  ];
  
  if (waterTax > 0) {
    breakdown.push({
      name: 'Water Tax',
      nameHi: 'जल कर',
      amount: waterTax,
    });
  }
  
  if (sanitationTax > 0) {
    breakdown.push({
      name: 'Sanitation Tax',
      nameHi: 'स्वच्छता कर',
      amount: sanitationTax,
    });
  }
  
  if (lightingTax > 0) {
    breakdown.push({
      name: 'Lighting Tax',
      nameHi: 'प्रकाश कर',
      amount: lightingTax,
    });
  }
  
  return {
    propertyTax,
    waterTax,
    sanitationTax,
    lightingTax,
    subtotal,
    rebate,
    lateFee,
    totalTax,
    breakdown,
  };
}

/**
 * Get Tax Rate Description
 */
export function getTaxRateDescription(
  propertyType: PropertyCategory,
  locationType: LocationType
): string {
  if (propertyType === 'Agricultural') {
    return `₹${MP_PANCHAYAT_TAX_RATES.agricultural.irrigated}/acre (Irrigated), ₹${MP_PANCHAYAT_TAX_RATES.agricultural.unirrigated}/acre (Unirrigated)`;
  }
  
  const typeKey = propertyType.toLowerCase() as 'residential' | 'commercial' | 'industrial';
  const rate = MP_PANCHAYAT_TAX_RATES[typeKey][locationType];
  
  return `₹${rate}/sq ft per year`;
}

/**
 * Get Location Type Label
 */
export function getLocationTypeLabel(locationType: LocationType): { en: string; hi: string } {
  const labels = {
    urban: { en: 'Urban Area', hi: 'शहरी क्षेत्र' },
    semiUrban: { en: 'Semi-Urban Area', hi: 'अर्ध-शहरी क्षेत्र' },
    rural: { en: 'Rural Area', hi: 'ग्रामीण क्षेत्र' },
  };
  
  return labels[locationType];
}
