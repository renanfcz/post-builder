import { NextRequest, NextResponse } from 'next/server'
import { WEBHOOK_CONFIG } from '@/lib/constants'
import { asyncOperationStore } from '@/lib/async-operations'

// Configure route timeout to 60 seconds
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('⏱️ [WEBHOOK-ASYNC] Request started at:', new Date().toISOString())
    
    const body = await request.json()
    console.log('📝 [WEBHOOK-ASYNC] Request body parsed:', { 
      message: body.message?.substring(0, 50) + '...', 
      conversation_id: body.conversation_id 
    })
    
    // Validate request body
    if (!body.message || !body.conversation_id) {
      console.log('❌ [WEBHOOK-ASYNC] Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Mensagem e conversation_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Generate operation ID
    const operationId = `${body.conversation_id}-${Date.now()}`
    
    // Store operation as pending
    asyncOperationStore.set(operationId, {
      status: 'pending',
      startTime: Date.now()
    })
    
    // Cleanup old operations
    asyncOperationStore.cleanup()

    // Start async operation
    processWebhookAsync(operationId, body).catch(error => {
      console.error('❌ [WEBHOOK-ASYNC] Background processing failed:', error)
      asyncOperationStore.set(operationId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro interno',
        startTime: Date.now()
      })
    })

    console.log('🚀 [WEBHOOK-ASYNC] Operation started:', operationId)
    
    // Return operation ID for polling
    return NextResponse.json({
      operation_id: operationId,
      status: 'processing',
      polling_url: `/api/webhook-status/${operationId}`,
      estimated_time: '30-60 seconds'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('❌ [WEBHOOK-ASYNC] Failed after', totalTime, 'ms:', error)
    
    return NextResponse.json({
      response: 'Erro ao processar solicitação',
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro de conexão'
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

async function processWebhookAsync(operationId: string, body: any) {
  const webhookUrl = WEBHOOK_CONFIG.EXTERNAL_URL
  
  console.log('🔗 [WEBHOOK-ASYNC] Calling external webhook:', webhookUrl)
  
  try {
    // Use a longer timeout for the async version (2 minutes)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secret: process.env.NEXT_PUBLIC_SECRET || '',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process webhook response
    const processedResponse = {
      response: data.output || 'Resposta vazia do webhook',
      post_content: null,
      is_final_post: false,
      suggestions: [],
      status: 'completed' as const,
    }
    
    // Store the result
    asyncOperationStore.set(operationId, {
      status: 'completed',
      result: processedResponse,
      startTime: Date.now()
    })
    
    console.log('✅ [WEBHOOK-ASYNC] Operation completed:', operationId)
    
  } catch (error) {
    console.error('❌ [WEBHOOK-ASYNC] Operation failed:', operationId, error)
    
    asyncOperationStore.set(operationId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro interno',
      startTime: Date.now()
    })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}