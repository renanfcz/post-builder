import winston from 'winston';
import { LogEntry, LogCategory } from './types';

// Remove sensitive data from objects
const sanitizeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Custom format for structured logging
export const structuredFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const logEntry: LogEntry = {
      timestamp: info.timestamp as string,
      level: info.level as LogEntry['level'],
      category: (info.category as LogCategory) || LogCategory.API,
      message: info.message as string,
      environment: process.env.NODE_ENV || 'development',
      service: 'post-builder',
      context: info.context ? sanitizeData(info.context) : undefined
    };

    // Add error details if present
    if (info.error && typeof info.error === 'object') {
      const error = info.error as Error;
      logEntry.context = {
        ...logEntry.context,
        error: {
          message: error.message,
          stack: error.stack || '',
          name: error.name
        }
      };
    }

    return JSON.stringify(logEntry, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  })
);

// Console format for development
export const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const category = info.category ? `[${info.category}]` : '[API]';
    const context = info.context ? ` ${JSON.stringify(sanitizeData(info.context), null, 0)}` : '';
    
    return `${info.timestamp} ${category} ${info.level}: ${info.message}${context}`;
  })
);

export { sanitizeData };