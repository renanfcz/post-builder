// Client-side logger (browser safe)
import { LogLevel, LogCategory, LogContext } from './types';

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, category: LogCategory, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const categoryLabel = `[${category}]`;
    
    if (this.isDevelopment) {
      // Development: colored console logs
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[37m'  // White
      };
      
      const color = colors[level] || '\x1b[37m';
      const reset = '\x1b[0m';
      const contextStr = context ? ` ${JSON.stringify(context, null, 0)}` : '';
      
      console.log(`${color}${timestamp} ${categoryLabel} ${level}:${reset} ${message}${contextStr}`);
    } else {
      // Production: structured JSON logs
      const logEntry = {
        timestamp,
        level,
        category,
        message,
        environment: 'production',
        service: 'post-builder-client',
        context: context ? this.sanitizeContext(context) : undefined
      };
      
      console.log(JSON.stringify(logEntry));
    }
  }

  private sanitizeContext(context: LogContext): LogContext {
    // Remove sensitive data from context
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...context };
    
    if (sanitized.metadata) {
      const sanitizedMetadata: any = {};
      Object.keys(sanitized.metadata).forEach(key => {
        const isSensitive = sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive)
        );
        sanitizedMetadata[key] = isSensitive ? '[REDACTED]' : sanitized.metadata![key];
      });
      sanitized.metadata = sanitizedMetadata;
    }
    
    return sanitized;
  }

  // Public logging methods
  error(message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, LogCategory.ERROR, message, context);
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
  polling(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.POLLING, message, context);
  }

  webhook(level: LogLevel, message: string, context?: LogContext) {
    this.log(level, LogCategory.WEBHOOK, message, context);
  }

  // Timer utility (simplified for client)
  timer() {
    const start = Date.now();
    return {
      end: (message: string, context?: LogContext) => {
        const duration = Date.now() - start;
        this.info(message, { ...context, duration });
        return duration;
      }
    };
  }
}

// Export singleton instance for client-side use
export const clientLogger = new ClientLogger();
export { LogLevel, LogCategory } from './types';
export type { LogContext } from './types';