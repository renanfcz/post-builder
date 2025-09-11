import { NextRequest, NextResponse } from 'next/server';
import { logger, LogContext } from './index';

export interface RequestLoggerOptions {
  includeBody?: boolean;
  includeHeaders?: boolean;
  maxBodyLength?: number;
}

// Middleware wrapper for API routes
export function withLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: RequestLoggerOptions = {}
): T {
  const { includeBody = true, includeHeaders = false, maxBodyLength = 1000 } = options;

  return (async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    // Create request context
    const baseContext: LogContext = {
      method,
      url,
      userAgent,
      ip
    };

    // Include headers if requested
    if (includeHeaders) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      baseContext.metadata = { headers };
    }

    // Include body for POST/PUT requests
    let body: any = null;
    if (includeBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        const clonedRequest = request.clone();
        const bodyText = await clonedRequest.text();
        
        if (bodyText) {
          // Truncate if too long
          const truncatedBody = bodyText.length > maxBodyLength 
            ? bodyText.substring(0, maxBodyLength) + '...' 
            : bodyText;
            
          try {
            body = JSON.parse(truncatedBody);
          } catch {
            body = truncatedBody;
          }
        }
      } catch (error) {
        logger.warn('Failed to parse request body for logging', {
          ...baseContext,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    const requestLogger = logger.request(method, url, {
      ...baseContext,
      metadata: {
        ...baseContext.metadata,
        body
      }
    });

    try {
      // Call the original handler
      const response = await handler(request, ...args);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusCode = response.status;

      // Log successful response
      requestLogger.success(statusCode, {
        duration,
        metadata: {
          ...baseContext.metadata,
          responseHeaders: Object.fromEntries(response.headers.entries())
        }
      });

      return response;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log error response
      requestLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        500,
        { duration }
      );

      // Re-throw the error
      throw error;
    }
  }) as T;
}

// Helper for extracting common request info
export function extractRequestInfo(request: NextRequest): LogContext {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown'
  };
}

// Helper for conversation ID extraction
export function extractConversationId(request: NextRequest): string | undefined {
  try {
    // Try URL params first (for GET requests)
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationIndex = pathSegments.findIndex(segment => segment === 'webhook-status') + 1;
    if (conversationIndex > 0 && conversationIndex < pathSegments.length) {
      return pathSegments[conversationIndex];
    }

    // Try query params
    const conversationId = url.searchParams.get('conversation_id');
    if (conversationId) return conversationId;

    return undefined;
  } catch {
    return undefined;
  }
}

// Helper for body parsing with error handling
export async function safeParseBody(request: NextRequest): Promise<any> {
  try {
    const text = await request.text();
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    logger.warn('Failed to parse request body', {
      error: error instanceof Error ? error : new Error(String(error)),
      url: request.url,
      method: request.method
    });
    return null;
  }
}