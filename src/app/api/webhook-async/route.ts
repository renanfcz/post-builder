import { NextRequest, NextResponse } from 'next/server'
import { WEBHOOK_CONFIG } from '@/lib/constants'
import { logger, LogLevel } from '@/lib/logger'
import { withLogging, extractRequestInfo, extractConversationId } from '@/lib/logger/middleware'

// Configure route timeout to 15 seconds (Netlify limit)
export const maxDuration = 15

async function handleWebhookAsync(request: NextRequest) {
  const timer = logger.timer()
  const requestInfo = extractRequestInfo(request)
  
  try {
    logger.webhook(LogLevel.INFO, 'Webhook async request started', {
      ...requestInfo,
      metadata: { timestamp: new Date().toISOString() }
    })
    
    const body = await request.json()
    const conversationId = body.conversation_id
    
    logger.webhook(LogLevel.DEBUG, 'Request body parsed', {
      ...requestInfo,
      conversationId,
      metadata: { 
        messageLength: body.message?.length,
        hasMessage: !!body.message,
        hasConversationId: !!conversationId
      }
    })
    
    // Validate request body
    if (!body.message || !conversationId) {
      logger.webhook(LogLevel.ERROR, 'Validation failed - missing required fields', {
        ...requestInfo,
        conversationId,
        metadata: { 
          hasMessage: !!body.message,
          hasConversationId: !!conversationId
        }
      })
      
      return NextResponse.json(
        { error: 'Mensagem e conversation_id são obrigatórios' },
        { status: 400 }
      )
    }

    const webhookUrl = WEBHOOK_CONFIG.EXTERNAL_URL
    
    logger.webhook(LogLevel.INFO, 'Calling external webhook', {
      ...requestInfo,
      conversationId,
      metadata: { 
        webhookUrl,
        messagePreview: body.message?.substring(0, 100)
      }
    })
    
    // Call external webhook with detailed logging
    const webhookTimer = logger.timer()
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secret: process.env.NEXT_PUBLIC_SECRET || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    const webhookDuration = webhookTimer.end('External webhook call completed', {
      conversationId,
      statusCode: response.status,
      metadata: { webhookUrl }
    })

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    logger.webhook(LogLevel.INFO, 'Webhook accepted request successfully', {
      ...requestInfo,
      conversationId,
      statusCode: response.status,
      duration: webhookDuration,
      metadata: { webhookUrl }
    })
    
    timer.end('Webhook async request completed successfully', {
      conversationId,
      statusCode: 200
    })
    
    // Return only HTTP 200 (no body)
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const totalDuration = timer.end('Webhook async request failed', {
      error: errorMessage
    })
    
    const conversationId = extractConversationId(request);
    logger.webhook(LogLevel.ERROR, 'Webhook async request failed', {
      ...requestInfo,
      conversationId: conversationId || undefined,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: totalDuration,
      metadata: { 
        webhookUrl: WEBHOOK_CONFIG.EXTERNAL_URL,
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    })
    
    return NextResponse.json({
      response: 'Erro ao processar solicitação',
      status: 'error',
      error: errorMessage
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
}

export const POST = withLogging(handleWebhookAsync, {
  includeBody: true,
  includeHeaders: false,
  maxBodyLength: 500
})


export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}