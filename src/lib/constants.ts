/**
 * Application Constants
 * 
 * Centralized constants to avoid magic numbers and strings
 * throughout the application.
 */

// Tax Types
export const TAX_TYPES = {
  PROPERTY: 'Property Tax',
  WATER: 'Water Tax',
  SANITATION: 'Sanitation Tax',
  LIGHTING: 'Lighting Tax',
  LAND: 'Land Tax',
  BUSINESS: 'Business Tax',
  OTHER: 'Other',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  PARTIAL: 'Partial',
} as const;

// Property Types
export const PROPERTY_TYPES = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  AGRICULTURAL: 'Agricultural',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
  CITIZEN: 'citizen',
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  // String lengths
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 500,
  MAX_REMARKS_LENGTH: 1000,
  MAX_SEARCH_QUERY_LENGTH: 100,
  
  // Numeric limits
  MIN_PROPERTY_AREA: 1,
  MAX_PROPERTY_AREA: 1000000, // 1 million sq ft
  MIN_TAX_AMOUNT: 0,
  MAX_TAX_AMOUNT: 10000000, // 1 crore
  MIN_TAX_RATE: 0,
  MAX_TAX_RATE: 100,
  
  // Phone number
  PHONE_NUMBER_LENGTH: 10,
  PHONE_NUMBER_WITH_CODE_LENGTH: 12,
  
  // File sizes
  MAX_FILE_SIZE_MB: 5,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Animation delays
  ANIMATION_DELAY_BASE: 50, // milliseconds
  ANIMATION_DELAY_INCREMENT: 50,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Debounce times
  SEARCH_DEBOUNCE_MS: 300,
  AUTOSAVE_DEBOUNCE_MS: 1000,
  
  // Toast durations
  TOAST_DURATION_SHORT: 3000,
  TOAST_DURATION_MEDIUM: 5000,
  TOAST_DURATION_LONG: 7000,
} as const;

// API/Network Constants
export const NETWORK_CONSTANTS = {
  // Timeouts
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  
  // Retry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  
  // Rate limiting
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATE_TIME: 'DD/MM/YYYY HH:mm:ss',
  INDIAN_DATE: 'DD-MM-YYYY',
} as const;

// Currency
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
  MIN_FRACTION_DIGITS: 2,
  MAX_FRACTION_DIGITS: 2,
} as const;

// Storage Keys (for localStorage/sessionStorage)
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'loni_panchayat_user_prefs',
  THEME: 'loni_panchayat_theme',
  LAST_ROUTE: 'loni_panchayat_last_route',
} as const;

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  BILLS: 'bills',
  SETTINGS: 'panchayat-settings',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  CREATED: 'Created successfully!',
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACE: /^[a-zA-Z0-9\s]+$/,
  PROPERTY_ID: /^[A-Z0-9_-]+$/,
} as const;

// Export types
export type TaxType = typeof TAX_TYPES[keyof typeof TAX_TYPES];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
