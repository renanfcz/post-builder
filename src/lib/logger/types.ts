export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export enum LogCategory {
  AUTH = 'AUTH',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  POLLING = 'POLLING',
  ERROR = 'ERROR',
  PERF = 'PERF',
  DEPLOY = 'DEPLOY',
  DATABASE = 'DATABASE'
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  conversationId?: string | undefined;
  userAgent?: string | undefined;
  ip?: string;
  url?: string;
  method?: string;
  duration?: number;
  statusCode?: number | undefined;
  error?: Error | string | { message: string; stack: string; name: string };
  attempt?: number;
  pollCount?: number;
  elapsed?: number;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: LogContext;
  environment: string;
  service: string;
}