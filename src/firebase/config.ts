/**
 * Firebase Configuration
 * 
 * Configuration is loaded from environment variables for security.
 * See .env.example for required variables.
 * 
 * SECURITY: All credentials must be in environment variables.
 * Never commit API keys or secrets to the repository.
 */

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Validate configuration
if (typeof window !== 'undefined') {
  const requiredKeys = ['projectId', 'appId', 'apiKey', 'authDomain'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
    console.error('Please set the environment variables in .env.local or .env.production');
  }
}
