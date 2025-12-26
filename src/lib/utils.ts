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

/**
 * Super Admin email - has full control over user management
 */
export const SUPER_ADMIN_EMAIL = 'kamalchand@lonipanchayat.in';

/**
 * Get admin emails from environment variable
 * Fallback to default admin email if not configured
 */
export function getAdminEmails(): string[] {
  const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim()).filter(Boolean);
  }
  return ['admin@lonipanchayat.in', SUPER_ADMIN_EMAIL]; // Default fallback
}

// Deprecated: Use getAdminEmails() instead
export const ADMIN_EMAILS = getAdminEmails();

/**
 * Check if an email belongs to an admin user
 * @param email - Email address to check
 * @returns True if the email is in the admin list
 */
export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.some((admin) => admin.toLowerCase() === email.toLowerCase());
}

/**
 * Check if an email belongs to the super admin
 * @param email - Email address to check
 * @returns True if the email is the super admin
 */
export function isSuperAdmin(email?: string): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Get display name for user - special handling for known users
 * @param email - User email
 * @param displayName - Firebase display name
 * @returns Display name to show
 */
export function getUserDisplayName(email?: string, displayName?: string | null): string {
  if (displayName) return displayName;
  
  // Special users mapping
  const knownUsers: Record<string, string> = {
    'kamalchand@lonipanchayat.in': 'Kamalchand Mahajan',
    'admin@lonipanchayat.in': 'Admin',
  };
  
  if (email && knownUsers[email.toLowerCase()]) {
    return knownUsers[email.toLowerCase()];
  }
  
  // Extract name from email
  if (email) {
    return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  
  return 'User';
}

/**
 * Format Indian phone numbers to standard format
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91-XXXXX-XXXXX
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Validate Aadhaar number format (12 digits)
 * @param aadhaar - Aadhaar number to validate
 * @returns True if valid format
 */
export function isValidAadhaar(aadhaar: string): boolean {
  const cleaned = aadhaar.replace(/\D/g, '');
  return cleaned.length === 12;
}

/**
 * Mask Aadhaar number for display (show only last 4 digits)
 * @param aadhaar - Aadhaar number to mask
 * @returns Masked Aadhaar number
 */
export function maskAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `XXXX-XXXX-${cleaned.slice(-4)}`;
  }
  return aadhaar;
}

/**
 * Calculate financial year from date
 * @param date - Date to calculate from
 * @returns Financial year string (e.g., "2024-25")
 */
export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Financial year starts from April (month 3)
  if (month < 3) {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
  return `${year}-${(year + 1).toString().slice(-2)}`;
}

/**
 * Convert assessment year number to financial year format
 * @param assessmentYear - Assessment year as number (e.g., 2025)
 * @returns Financial year string (e.g., "2025-26" or "2024-25")
 */
export function assessmentYearToFY(assessmentYear: number, isStartYear: boolean = true): string {
  if (isStartYear) {
    // If this is the start year of FY (April onwards)
    return `${assessmentYear}-${(assessmentYear + 1).toString().slice(-2)}`;
  } else {
    // If this is the end year of FY (Jan-March)
    return `${assessmentYear - 1}-${assessmentYear.toString().slice(-2)}`;
  }
}

/**
 * Parse financial year string to start and end years
 * @param fy - Financial year string (e.g., "2025-26")
 * @returns Object with startYear and endYear as numbers
 */
export function parseFY(fy: string): { startYear: number; endYear: number } {
  const [startYear, endYearShort] = fy.split('-');
  const start = parseInt(startYear);
  const end = parseInt('20' + endYearShort);
  return { startYear: start, endYear: end };
}

/**
 * Check if a date falls within a financial year
 * @param date - Date to check
 * @param fy - Financial year string (e.g., "2025-26")
 * @returns True if date is within the financial year
 */
export function isDateInFY(date: Date | string, fy: string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { startYear, endYear } = parseFY(fy);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  
  // April startYear to December startYear
  if (year === startYear && month >= 4) return true;
  // January endYear to March endYear
  if (year === endYear && month <= 3) return true;
  
  return false;
}

/**
 * Check if assessment year matches a financial year
 * @param assessmentYear - Assessment year as number
 * @param fy - Financial year string (e.g., "2025-26")
 * @returns True if assessment year can belong to this FY
 */
export function isAssessmentYearInFY(assessmentYear: number, fy: string): boolean {
  const { startYear, endYear } = parseFY(fy);
  // Assessment year can be either the start or end year of FY
  return assessmentYear === startYear || assessmentYear === endYear;
}

/**
 * Calculate tax penalty based on days overdue
 * @param dueDate - Due date for payment
 * @param penaltyRate - Penalty rate percentage per month
 * @returns Penalty percentage
 */
export function calculatePenalty(dueDate: Date, penaltyRate: number): number {
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  
  // Calculate penalty per month
  const months = Math.ceil(diffDays / 30);
  return months * penaltyRate;
}

/**
 * Format date to Indian format (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatIndianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate a unique property ID
 * @returns Property ID in format PROP{timestamp}
 */
export function generatePropertyId(): string {
  return `PROP${Date.now()}`;
}

/**
 * Generate a unique tax record ID
 * @param index - Optional index for multiple records
 * @returns Tax record ID in format TAX{timestamp}{index}
 */
export function generateTaxId(index: number = 0): string {
  return `TAX${Date.now()}${index}`;
}

/**
 * Generate a unique receipt number
 * @returns Receipt number in format RCP{YY}{MM}{XXXX}
 */
export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP${year}${month}${random}`;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate total tax amount for a property
 * @param taxes - Array of tax records
 * @returns Total assessed, paid, and due amounts
 */
export function calculateTotalTax(taxes: Array<{ assessedAmount: number; amountPaid: number }>) {
  const totalAssessed = taxes.reduce((sum, tax) => sum + tax.assessedAmount, 0);
  const totalPaid = taxes.reduce((sum, tax) => sum + tax.amountPaid, 0);
  const totalDue = totalAssessed - totalPaid;
  
  return { totalAssessed, totalPaid, totalDue };
}

/**
 * Get payment status color for UI
 * @param status - Payment status
 * @returns Tailwind color class
 */
export function getPaymentStatusColor(status: 'Paid' | 'Unpaid' | 'Partial'): string {
  switch (status) {
    case 'Paid':
      return 'text-green-600 bg-green-50';
    case 'Unpaid':
      return 'text-red-600 bg-red-50';
    case 'Partial':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
    