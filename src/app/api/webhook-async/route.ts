import { NextRequest, NextResponse } from 'next/server'
import { WEBHOOK_CONFIG } from '@/lib/constants'

// Configure route timeout to 15 seconds (Netlify limit)
export const maxDuration = 15

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

    const conversationId = body.conversation_id
    console.log('🆔 [WEBHOOK-ASYNC] Processing conversation_id:', conversationId)

    const webhookUrl = WEBHOOK_CONFIG.EXTERNAL_URL
    console.log('🔗 [WEBHOOK-ASYNC] Calling external webhook:', webhookUrl)
    
    // Call external webhook (should return 200 immediately)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secret: process.env.NEXT_PUBLIC_SECRET || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 seconds timeout for initial call
    })

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    console.log('✅ [WEBHOOK-ASYNC] Webhook accepted request for conversation:', conversationId)
    console.log('🚀 [WEBHOOK-ASYNC] Backend will handle Redis storage and polling:', conversationId)
    
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


export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}