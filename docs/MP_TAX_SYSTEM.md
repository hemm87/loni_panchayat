# MP Panchayat Tax Calculation System

## Overview
Complete tax calculation system based on Madhya Pradesh Panchayat Raj Act with official government rates for 2024-25.

## Tax Rates Structure

### 1. Property Tax (per sq ft)
Based on property type and location:

| Property Type | Urban | Semi-Urban | Rural |
|--------------|-------|------------|-------|
| **Residential** (आवासीय) | ₹3.00 | ₹2.00 | ₹1.50 |
| **Commercial** (व्यावसायिक) | ₹6.00 | ₹4.50 | ₹3.50 |
| **Industrial** (औद्योगिक) | ₹8.00 | ₹6.00 | ₹5.00 |

### 2. Agricultural Land Tax (per acre)
| Land Type | Rate |
|-----------|------|
| **Irrigated** (सिंचित) | ₹200/acre |
| **Unirrigated** (असिंचित) | ₹100/acre |

### 3. Additional Annual Taxes

#### Water Tax (जल कर)
| Property Type | Annual Rate |
|--------------|-------------|
| Residential | ₹600 |
| Commercial | ₹1,200 |
| Industrial | ₹2,400 |
| Agricultural | N/A |

#### Sanitation Tax (स्वच्छता कर)
| Property Type | Annual Rate |
|--------------|-------------|
| Residential | ₹300 |
| Commercial | ₹600 |
| Industrial | ₹1,200 |
| Agricultural | N/A |

#### Lighting Tax (प्रकाश कर)
| Property Type | Annual Rate |
|--------------|-------------|
| Residential | ₹240 |
| Commercial | ₹480 |
| Industrial | ₹960 |
| Agricultural | N/A |

## Financial Incentives and Penalties

### Early Payment Rebate
- **5% discount** if paid before **March 31st**
- Applies to total tax amount before rebate
- Encourages timely payment

### Late Fee
- **1.5% per month** on unpaid amount
- Calculated from April 1st onwards
- **Maximum cap: 50%** of subtotal
- Example: ₹10,000 tax × 6 months late = ₹900 late fee

## Calculation Examples

### Example 1: Residential Property (Semi-Urban)
```
Property Details:
- Type: Residential
- Location: Semi-Urban
- Area: 1,000 sq ft

Calculation:
Property Tax:    1,000 × ₹2.00     = ₹2,000
Water Tax:                          = ₹600
Sanitation Tax:                     = ₹300
Lighting Tax:                       = ₹240
                                   ─────────
Subtotal:                          = ₹3,140
Early Payment Rebate (5%):         = -₹157
                                   ─────────
Total Annual Tax:                  = ₹2,983
```

### Example 2: Commercial Property (Urban)
```
Property Details:
- Type: Commercial
- Location: Urban
- Area: 500 sq ft

Calculation:
Property Tax:    500 × ₹6.00       = ₹3,000
Water Tax:                          = ₹1,200
Sanitation Tax:                     = ₹600
Lighting Tax:                       = ₹480
                                   ─────────
Subtotal:                          = ₹5,280
Early Payment Rebate (5%):         = -₹264
                                   ─────────
Total Annual Tax:                  = ₹5,016
```

### Example 3: Agricultural Land (Rural)
```
Property Details:
- Type: Agricultural
- Land Type: Irrigated
- Area: 5 acres

Calculation:
Land Tax:        5 × ₹200          = ₹1,000
                                   ─────────
Subtotal:                          = ₹1,000
Early Payment Rebate (5%):         = -₹50
                                   ─────────
Total Annual Tax:                  = ₹950
```

### Example 4: Industrial Property (Urban) - Late Payment
```
Property Details:
- Type: Industrial
- Location: Urban
- Area: 2,000 sq ft
- Payment: 4 months late

Calculation:
Property Tax:    2,000 × ₹8.00     = ₹16,000
Water Tax:                          = ₹2,400
Sanitation Tax:                     = ₹1,200
Lighting Tax:                       = ₹960
                                   ─────────
Subtotal:                          = ₹20,560
Late Fee (1.5% × 4 months):        = ₹1,234
                                   ─────────
Total Amount Due:                  = ₹21,794
```

## Location Type Definitions

### Urban (शहरी क्षेत्र)
- Municipal corporation areas
- Large town panchayats
- High-density commercial zones
- **Highest tax rates**

### Semi-Urban (अर्ध-शहरी क्षेत्र)
- Nagar panchayat areas
- Growing towns
- Moderate development
- **Medium tax rates**

### Rural (ग्रामीण क्षेत्र)
- Gram panchayat areas
- Villages
- Agricultural zones
- **Lowest tax rates**

## Implementation

### Tax Calculator Tool
The MP Tax Calculator tool in the dashboard provides:
- **Location-based calculation** (urban/semi-urban/rural)
- **Property type selection** with Hindi labels
- **Agricultural land support** (irrigated/unirrigated)
- **Optional additional taxes** (water, sanitation, lighting)
- **Comprehensive breakdown** with bilingual display
- **Rebate calculation** for early payment
- **Professional government-compliant** interface

### Usage
1. Navigate to **Dashboard → Utility Tools**
2. Click **Tax Calculator**
3. Enter property details:
   - Area (sq ft or acres)
   - Property type
   - Location type
   - For agricultural: select irrigated/unirrigated
   - Check additional taxes if applicable
4. Click **Calculate Tax**
5. View detailed breakdown with:
   - Individual tax components
   - Subtotal
   - Early payment rebate (if before March 31)
   - Total annual tax

### Property Valuation Tool
Also updated with MP circle rates 2024-25:

| Property Type | Urban | Semi-Urban | Rural |
|--------------|-------|------------|-------|
| Residential | ₹4,500/sq ft | ₹2,800/sq ft | ₹1,500/sq ft |
| Commercial | ₹8,000/sq ft | ₹5,500/sq ft | ₹3,000/sq ft |
| Industrial | ₹6,500/sq ft | ₹4,000/sq ft | ₹2,500/sq ft |

## Code Structure

### Main Calculator Module
**File**: `src/lib/mp-tax-calculator.ts`

**Key Functions**:
```typescript
// Calculate property tax based on area, type, and location
calculatePropertyTax(area, propertyType, locationType)

// Calculate water tax (annual fixed amount)
calculateWaterTax(propertyType)

// Calculate sanitation tax (annual fixed amount)
calculateSanitationTax(propertyType)

// Calculate lighting tax (annual fixed amount)
calculateLightingTax(propertyType)

// Calculate early payment rebate (5% before March 31)
calculateRebate(subtotal, paymentDate)

// Calculate late fee (1.5% per month, capped at 50%)
calculateLateFee(subtotal, dueDate, paymentDate)

// Main function: comprehensive tax calculation
calculateComprehensiveTax(input: TaxCalculationInput): TaxBreakdown
```

**Types**:
```typescript
type LocationType = 'urban' | 'semiUrban' | 'rural';
type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
type AgriculturalType = 'irrigated' | 'unirrigated';

interface TaxCalculationInput {
  area: number;
  propertyType: PropertyCategory;
  locationType: LocationType;
  agriculturalType?: AgriculturalType;
  includeWaterTax?: boolean;
  includeSanitationTax?: boolean;
  includeLightingTax?: boolean;
  paymentDate?: Date;
  assessmentYear: number;
}

interface TaxBreakdown {
  propertyTax: number;
  waterTax: number;
  sanitationTax: number;
  lightingTax: number;
  subtotal: number;
  rebate: number;
  lateFee: number;
  total: number;
  breakdown: Array<{
    name: string;
    nameHi: string;
    amount: number;
  }>;
}
```

## Integration Points

### Current Implementation
✅ **Tax Calculator Tool** - Interactive calculator with MP rates
✅ **Property Valuation Tool** - Market rate estimation with MP circle rates
✅ **Due Date Checker** - Overdue payment monitoring

### Pending Integration
- [ ] Bill generation system
- [ ] Property registration form (add location type field)
- [ ] Tax receipt generation
- [ ] Bulk bill generation with MP rates
- [ ] Admin settings for rate configuration

## Compliance Notes

### Based On
- **MP Panchayat Raj Act**
- **MP Nagar Palika Act**
- **Circle rates** as per Revenue Department 2024-25

### Features for Compliance
- Bilingual labels (English/Hindi)
- Government-standard tax categories
- Official rate structure
- Transparent calculation breakdown
- Receipt-ready format

## Future Enhancements

### Planned Features
1. **Rate Configuration** - Admin panel to update rates
2. **Historical Rates** - Track rate changes over years
3. **Zone-based Rates** - Sub-categories within location types
4. **Property Classification** - Plot vs Built-up area differentiation
5. **Exemptions** - Senior citizen, BPL category discounts
6. **Surcharges** - Special development charges
7. **Integration** - Apply to bill generation system

### API Endpoint (Future)
```typescript
POST /api/calculate-tax
Request: TaxCalculationInput
Response: TaxBreakdown
```

## Support

For questions or updates to tax rates, contact:
- **Technical**: Development team
- **Policy**: Panchayat administration
- **Rates**: Revenue department

## Changelog

### Version 1.0.0 (Current)
- ✅ Implemented MP Panchayat Raj Act rates
- ✅ Location-based taxation (urban/semi-urban/rural)
- ✅ 4 property types supported
- ✅ Agricultural land taxation
- ✅ Additional taxes (water, sanitation, lighting)
- ✅ Early payment rebate (5%)
- ✅ Late fee calculation (1.5% per month)
- ✅ Interactive calculator tool
- ✅ Property valuation tool with MP circle rates
- ✅ Bilingual interface (English/Hindi)

---

**Last Updated**: 2024 (Based on MP Panchayat Raj Act and Circle Rates 2024-25)
