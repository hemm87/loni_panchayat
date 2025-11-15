/**
 * Centralized Logging System
 * 
 * Provides structured logging with different log levels
 * and environment-aware output.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private enableConsoleLogs: boolean;
  private logLevel: LogLevel;
  
  constructor() {
    this.enableConsoleLogs = process.env.NODE_ENV !== 'production' || 
                             process.env.ENABLE_CONSOLE_LOGS === 'true';
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
  
  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
  }
  
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToErrorTracking(entry);
    }
    
    // Console logging for development
    if (this.enableConsoleLogs) {
      const formatted = this.formatMessage(entry);
      
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted, error);
          break;
      }
    }
  }
  
  /**
   * Send error logs to external tracking service
   * Integrate with Sentry, LogRocket, or similar services here
   */
  private sendToErrorTracking(entry: LogEntry): void {
    // TODO: Integrate with error tracking service (Sentry, etc.)
    // Example: Sentry.captureException(entry.error, { extra: entry.context });
  }
  
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }
  
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
