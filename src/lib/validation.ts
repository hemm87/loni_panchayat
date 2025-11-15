/**
 * Validation helpers and constants for the Loni Panchayat Tax Management System
 */

/**
 * Property type options
 */
export const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Agricultural',
  'Industrial',
  'Mixed',
] as const;

/**
 * Tax type options with Hindi translations
 */
export const TAX_TYPES = [
  { value: 'Property Tax', label: 'Property Tax', hindi: 'संपत्ति कर' },
  { value: 'Water Tax', label: 'Water Tax', hindi: 'जल कर' },
  { value: 'Sanitation Tax', label: 'Sanitation Tax', hindi: 'स्वच्छता कर' },
  { value: 'Lighting Tax', label: 'Lighting Tax', hindi: 'प्रकाश कर' },
  { value: 'Land Tax', label: 'Land Tax', hindi: 'भूमि कर' },
  { value: 'Business Tax', label: 'Business Tax', hindi: 'व्यापार कर' },
  { value: 'Other', label: 'Other', hindi: 'अन्य' },
] as const;

/**
 * Payment status options
 */
export const PAYMENT_STATUSES = ['Paid', 'Unpaid', 'Partial'] as const;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  // Phone number
  phone: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Phone number must be 10 digits starting with 6-9',
  },
  
  // Aadhaar
  aadhaar: {
    pattern: /^\d{12}$/,
    message: 'Aadhaar must be exactly 12 digits',
  },
  
  // Email
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  
  // PIN code
  pinCode: {
    pattern: /^\d{6}$/,
    message: 'PIN code must be exactly 6 digits',
  },
  
  // Amount
  amount: {
    min: 0,
    message: 'Amount must be a positive number',
  },
  
  // Area (square feet)
  area: {
    min: 1,
    max: 1000000,
    message: 'Area must be between 1 and 1,000,000 sq.ft.',
  },
  
  // House number
  houseNo: {
    pattern: /^[A-Z0-9\-/]+$/i,
    message: 'House number can contain letters, numbers, hyphens, and slashes',
  },
  
  // Name
  name: {
    pattern: /^[a-zA-Z\s.]+$/,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be 2-100 characters and contain only letters, spaces, and dots',
  },
} as const;

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): { valid: boolean; message?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  if (!VALIDATION_RULES.phone.pattern.test(cleaned)) {
    return { valid: false, message: VALIDATION_RULES.phone.message };
  }
  
  return { valid: true };
}

/**
 * Validate Aadhaar number
 */
export function validateAadhaar(aadhaar: string): { valid: boolean; message?: string } {
  const cleaned = aadhaar.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, message: 'Aadhaar number is required' };
  }
  
  if (!VALIDATION_RULES.aadhaar.pattern.test(cleaned)) {
    return { valid: false, message: VALIDATION_RULES.aadhaar.message };
  }
  
  return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { valid: false, message: VALIDATION_RULES.email.message };
  }
  
  return { valid: true };
}

/**
 * Validate PIN code
 */
export function validatePinCode(pinCode: string): { valid: boolean; message?: string } {
  const cleaned = pinCode.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, message: 'PIN code is required' };
  }
  
  if (!VALIDATION_RULES.pinCode.pattern.test(cleaned)) {
    return { valid: false, message: VALIDATION_RULES.pinCode.message };
  }
  
  return { valid: true };
}

/**
 * Validate amount
 */
export function validateAmount(amount: number): { valid: boolean; message?: string } {
  if (amount === undefined || amount === null) {
    return { valid: false, message: 'Amount is required' };
  }
  
  if (amount < VALIDATION_RULES.amount.min) {
    return { valid: false, message: VALIDATION_RULES.amount.message };
  }
  
  return { valid: true };
}

/**
 * Validate area
 */
export function validateArea(area: number): { valid: boolean; message?: string } {
  if (area === undefined || area === null) {
    return { valid: false, message: 'Area is required' };
  }
  
  if (area < VALIDATION_RULES.area.min || area > VALIDATION_RULES.area.max) {
    return { valid: false, message: VALIDATION_RULES.area.message };
  }
  
  return { valid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): { valid: boolean; message?: string } {
  if (!name || !name.trim()) {
    return { valid: false, message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION_RULES.name.minLength || 
      trimmedName.length > VALIDATION_RULES.name.maxLength) {
    return { valid: false, message: VALIDATION_RULES.name.message };
  }
  
  if (!VALIDATION_RULES.name.pattern.test(trimmedName)) {
    return { valid: false, message: VALIDATION_RULES.name.message };
  }
  
  return { valid: true };
}

/**
 * Validate house number
 */
export function validateHouseNo(houseNo: string): { valid: boolean; message?: string } {
  if (!houseNo || !houseNo.trim()) {
    return { valid: false, message: 'House number is required' };
  }
  
  if (!VALIDATION_RULES.houseNo.pattern.test(houseNo.trim())) {
    return { valid: false, message: VALIDATION_RULES.houseNo.message };
  }
  
  return { valid: true };
}

/**
 * Validate property type
 */
export function validatePropertyType(type: string): { valid: boolean; message?: string } {
  if (!type) {
    return { valid: false, message: 'Property type is required' };
  }
  
  if (!PROPERTY_TYPES.includes(type as any)) {
    return { valid: false, message: 'Invalid property type' };
  }
  
  return { valid: true };
}

/**
 * Comprehensive property validation
 */
export function validateProperty(property: {
  ownerName: string;
  fatherName?: string;
  mobileNumber: string;
  houseNo: string;
  address: string;
  propertyType: string;
  area: number;
  aadhaarHash?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate owner name
  const nameValidation = validateName(property.ownerName);
  if (!nameValidation.valid) {
    errors.ownerName = nameValidation.message || 'Invalid name';
  }
  
  // Validate father name if provided
  if (property.fatherName) {
    const fatherNameValidation = validateName(property.fatherName);
    if (!fatherNameValidation.valid) {
      errors.fatherName = fatherNameValidation.message || 'Invalid father name';
    }
  }
  
  // Validate mobile number
  const phoneValidation = validatePhoneNumber(property.mobileNumber);
  if (!phoneValidation.valid) {
    errors.mobileNumber = phoneValidation.message || 'Invalid phone number';
  }
  
  // Validate house number
  const houseNoValidation = validateHouseNo(property.houseNo);
  if (!houseNoValidation.valid) {
    errors.houseNo = houseNoValidation.message || 'Invalid house number';
  }
  
  // Validate address
  if (!property.address || property.address.trim().length < 10) {
    errors.address = 'Address must be at least 10 characters';
  }
  
  // Validate property type
  const typeValidation = validatePropertyType(property.propertyType);
  if (!typeValidation.valid) {
    errors.propertyType = typeValidation.message || 'Invalid property type';
  }
  
  // Validate area
  const areaValidation = validateArea(property.area);
  if (!areaValidation.valid) {
    errors.area = areaValidation.message || 'Invalid area';
  }
  
  // Validate Aadhaar if provided
  if (property.aadhaarHash) {
    const aadhaarValidation = validateAadhaar(property.aadhaarHash);
    if (!aadhaarValidation.valid) {
      errors.aadhaarHash = aadhaarValidation.message || 'Invalid Aadhaar';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get error message from validation result
 */
export function getValidationError(field: string, errors: Record<string, string>): string | undefined {
  return errors[field];
}

/**
 * Check if form has any errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
