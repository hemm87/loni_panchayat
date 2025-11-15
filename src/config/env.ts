/**
 * Environment Variable Configuration
 * 
 * This module provides type-safe access to environment variables
 * and validates required configuration on application startup.
 */

interface EnvironmentConfig {
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    measurementId: string;
    messagingSenderId: string;
  };
  
  // Application Configuration
  app: {
    name: string;
    env: 'development' | 'production' | 'test';
    url: string;
  };
  
  // Admin Configuration
  admin: {
    emails: string[];
  };
  
  // Feature Flags
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  
  // Security
  security: {
    forceHttps: boolean;
  };
  
  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsoleLogs: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

/**
 * Parse boolean environment variable
 */
function parseBool(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validate and load environment configuration
 */
export const env: EnvironmentConfig = {
  firebase: {
    apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId: getEnvVar('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', ''),
    messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  },
  
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Loni Panchayat'),
    env: (getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') as any),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:9002'),
  },
  
  admin: {
    emails: getEnvVar('NEXT_PUBLIC_ADMIN_EMAILS', 'admin@lonipanchayat.in').split(',').map(e => e.trim()),
  },
  
  features: {
    enableAnalytics: parseBool(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, false),
    enableErrorReporting: parseBool(process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING, false),
  },
  
  security: {
    forceHttps: parseBool(process.env.NEXT_PUBLIC_FORCE_HTTPS, false),
  },
  
  logging: {
    level: (getEnvVar('LOG_LEVEL', 'info') as any),
    enableConsoleLogs: parseBool(process.env.ENABLE_CONSOLE_LOGS, process.env.NODE_ENV !== 'production'),
  },
};

/**
 * Validate environment configuration on startup
 */
export function validateEnv(): void {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\nPlease copy .env.example to .env and fill in the values.`
    );
  }
}

// Validate on module load in non-browser environments
if (typeof window === 'undefined') {
  validateEnv();
}

export default env;
