/**
 * Global Error Boundary
 * 
 * Catches React errors and displays a user-friendly fallback UI
 * while logging errors for debugging.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
          <div className="max-w-2xl w-full bg-card rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-destructive/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mt-1">
                  कुछ गलत हो गया
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <p className="text-foreground mb-4">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
              <p className="text-muted-foreground text-sm">
                The error has been logged and will be investigated. Please try refreshing the page.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                <summary className="cursor-pointer font-semibold text-destructive mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto max-h-60 text-foreground/80">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReload}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary helper
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
