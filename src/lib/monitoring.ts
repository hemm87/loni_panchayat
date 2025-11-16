/**
 * Firebase Monitoring & Analytics
 * 
 * Provides performance monitoring, analytics, and error tracking
 * for the Loni Panchayat application
 */

import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { getPerformance, type FirebasePerformance } from 'firebase/performance';
import type { FirebaseApp } from 'firebase/app';

let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

/**
 * Initialize Firebase Analytics
 */
export function initializeAnalytics(app: FirebaseApp) {
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    } catch (error) {
      console.warn('Failed to initialize Analytics:', error);
    }
  }
}

/**
 * Initialize Firebase Performance Monitoring
 */
export function initializePerformance(app: FirebaseApp) {
  if (typeof window !== 'undefined') {
    try {
      performance = getPerformance(app);
      console.log('✅ Firebase Performance Monitoring initialized');
    } catch (error) {
      console.warn('Failed to initialize Performance Monitoring:', error);
    }
  }
}

/**
 * Log custom analytics events
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }
}

/**
 * Track page views
 */
export function trackPageView(pageName: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_name: pageName,
    page_title: pageTitle || pageName,
  });
}

/**
 * Track user actions
 */
export const trackUserAction = {
  propertyRegistered: (propertyId: string) => {
    trackEvent('property_registered', { property_id: propertyId });
  },
  
  billGenerated: (propertyId: string, amount: number) => {
    trackEvent('bill_generated', { 
      property_id: propertyId,
      amount: amount 
    });
  },
  
  billDownloaded: (propertyId: string, billId: string) => {
    trackEvent('bill_downloaded', {
      property_id: propertyId,
      bill_id: billId
    });
  },
  
  reportGenerated: (reportType: string) => {
    trackEvent('report_generated', { report_type: reportType });
  },
  
  userLogin: (userId: string) => {
    trackEvent('login', { user_id: userId });
  },
  
  userLogout: () => {
    trackEvent('logout');
  },
  
  searchPerformed: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  },
  
  errorOccurred: (errorMessage: string, errorCode?: string) => {
    trackEvent('error', {
      error_message: errorMessage,
      error_code: errorCode
    });
  }
};

/**
 * Get analytics instance
 */
export function getAnalyticsInstance() {
  return analytics;
}

/**
 * Get performance instance
 */
export function getPerformanceInstance() {
  return performance;
}
