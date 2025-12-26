'use client';

import React from 'react';

interface RupeeProps {
  amount?: number | string;
  className?: string;
  showSymbol?: boolean;
}

/**
 * Rupee Component - Ensures proper rendering of Indian Rupee symbol
 * Uses Noto Sans font which has proper ₹ symbol support
 */
export function Rupee({ amount, className = '', showSymbol = true }: RupeeProps) {
  const formattedAmount = typeof amount === 'number' 
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : amount;

  return (
    <span 
      className={className}
      style={{ 
        fontFamily: '"Noto Sans", "Arial Unicode MS", "Segoe UI Symbol", sans-serif',
      }}
    >
      {showSymbol && <span style={{ fontFamily: '"Noto Sans", sans-serif' }}>₹</span>}
      {formattedAmount}
    </span>
  );
}

/**
 * RupeeSymbol - Just the ₹ symbol with proper font
 */
export function RupeeSymbol({ className = '' }: { className?: string }) {
  return (
    <span 
      className={className}
      style={{ 
        fontFamily: '"Noto Sans", "Arial Unicode MS", "Segoe UI Symbol", sans-serif',
      }}
    >
      ₹
    </span>
  );
}

/**
 * Format currency with proper Rupee symbol
 */
export function formatRupee(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
