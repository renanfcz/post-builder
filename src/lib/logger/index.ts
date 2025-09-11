import winston from 'winston';
import { LogLevel, LogCategory, LogContext } from './types';
import { structuredFormat, consoleFormat } from './formatters';

// Conditional import for server-side only
let DailyRotateFile: any = null;
if (typeof window === 'undefined') {
  try {
    DailyRotateFile = require('winston-daily-rotate-file');
  } catch (error) {
    console.warn('winston-daily-rotate-file not available, file logging disabled');
  }
}

class Logger {
  private winston: winston.Logger;

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

    // Create transports
    const transports: winston.transport[] = [];

    // Console transport (always enabled in development)
    if (isDevelopment) {
      transports.push(
        new winston.transports.Console({
          level: logLevel,
          format: consoleFormat
        })
      );
    }

    // File transport (production and when explicitly enabled)
    if (DailyRotateFile && (!isDevelopment || process.env.ENABLE_FILE_LOGGING === 'true')) {
      // Error logs
      transports.push(
        new DailyRotateFile({
          level: 'error',
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: structuredFormat
        })
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          level: logLevel,
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          format: structuredFormat
        })
      );
    }

    // JSON transport for production (stdout)
    if (!isDevelopment) {
      transports.push(
        new winston.transports.Console({
          level: logLevel,
          format: structuredFormat
        })
      );
    }

    this.winston = winston.createLogger({
      level: logLevel,
      transports,
      // Handle uncaught exceptions and rejections
      exceptionHandlers: isDevelopment ? [] : [
        new winston.transports.Console({ format: structuredFormat })
      ],
      rejectionHandlers: isDevelopment ? [] : [
        new winston.transports.Console({ format: structuredFormat })
      ]
    });
  }

  private log(level: LogLevel, category: LogCategory, message: string, context?: LogContext) {
    // Generate request ID if not provided
    const requestId = context?.requestId || this.generateRequestId();
    
    this.winston.log({
      level,
      category,
      message,
      context: context ? { ...context, requestId } : { requestId }
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public logging methods
  error(message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, context?.error ? LogCategory.ERROR : LogCategory.API, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, LogCategory.API, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, LogCategory.API, message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, LogCategory.API, message, context);
  }

  // Category-specific methods
  auth(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.AUTH, message, context);
  }

  webhook(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.WEBHOOK, message, context);
  }

  polling(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.POLLING, message, context);
  }

  performance(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, LogCategory.PERF, message, context);
  }

  deploy(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.DEPLOY, message, context);
  }

  // Utility methods
  timer() {
    const start = process.hrtime.bigint();
    return {
      end: (message: string, context?: LogContext) => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        this.performance(message, { ...context, duration });
        return duration;
      }
    };
  }

  // Request logger helper
  request(method: string, url: string, context?: Omit<LogContext, 'method' | 'url'>) {
    const requestId = this.generateRequestId();
    const startTime = process.hrtime.bigint();
    
    this.info(`${method} ${url} - Request started`, {
      ...context,
      method,
      url,
      requestId
    });

    return {
      requestId,
      success: (statusCode: number, additionalContext?: LogContext) => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        
        this.info(`${method} ${url} - Request completed`, {
          ...context,
          ...additionalContext,
          method,
          url,
          requestId,
          statusCode,
          duration
        });
      },
      error: (error: Error | string, statusCode?: number, additionalContext?: LogContext) => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        
        this.error(`${method} ${url} - Request failed`, {
          ...context,
          ...additionalContext,
          method,
          url,
          requestId,
          statusCode,
          duration,
          error: typeof error === 'string' ? new Error(error) : error
        });
      }
    };
  }
}

// Export singleton instance
export const logger = new Logger();
export { LogLevel, LogCategory } from './types';
export type { LogContext } from './types';