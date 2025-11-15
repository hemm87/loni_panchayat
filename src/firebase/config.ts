/**
 * Firebase Configuration
 * 
 * Configuration is loaded from environment variables for security.
 * See .env.example for required variables.
 */

// For development fallback only - REMOVE in production
const DEV_FALLBACK_CONFIG = {
  projectId: "studio-7943908738-8bbf8",
  appId: "1:392878434867:web:78bbe0731e745654be1146",
  apiKey: "AIzaSyDOC7T94WuuLw3j2isTaoDAvUmDMrCslyQ",
  authDomain: "studio-7943908738-8bbf8.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "392878434867"
};

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEV_FALLBACK_CONFIG.projectId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEV_FALLBACK_CONFIG.appId,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEV_FALLBACK_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEV_FALLBACK_CONFIG.authDomain,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEV_FALLBACK_CONFIG.measurementId,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEV_FALLBACK_CONFIG.messagingSenderId,
};

// Validate configuration in production (only if not using fallback)
if (process.env.NODE_ENV === 'production' && !DEV_FALLBACK_CONFIG) {
  const requiredKeys = ['projectId', 'appId', 'apiKey', 'authDomain'];
  const missingKeys = requiredKeys.filter(key => !process.env[`NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`]);
  
  if (missingKeys.length > 0) {
    console.warn(`Warning: Using fallback Firebase config. Set these environment variables for production: ${missingKeys.join(', ')}`);
  }
}
