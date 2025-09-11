import { NextRequest, NextResponse } from 'next/server'
import { WEBHOOK_CONFIG } from '@/lib/constants'

// Configure route timeout to 60 seconds
export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: any = { message: 'mensagem vazia' }
  const startTime = Date.now()
  
  try {
    console.log('⏱️ [WEBHOOK] Request started at:', new Date().toISOString())
    
    body = await request.json()
    console.log('📝 [WEBHOOK] Request body parsed:', { 
      message: body.message?.substring(0, 50) + '...', 
      conversation_id: body.conversation_id 
    })
    
    // Validate request body
    if (!body.message || !body.conversation_id) {
      console.log('❌ [WEBHOOK] Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Mensagem e conversation_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Forward request to actual webhook
    const webhookUrl = WEBHOOK_CONFIG.EXTERNAL_URL
    
    console.log('🔗 [WEBHOOK] Calling external webhook:', webhookUrl)
    console.log('⏰ [WEBHOOK] Time elapsed before fetch:', Date.now() - startTime, 'ms')
    
    const fetchStartTime = Date.now()
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secret: process.env.NEXT_PUBLIC_SECRET || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000), // 55 seconds timeout for the fetch
    });

    console.log('🏁 [WEBHOOK] Fetch completed in:', Date.now() - fetchStartTime, 'ms')
    console.log('📊 [WEBHOOK] Response status:', response.status, response.statusText)

    if (!response.ok) {
      console.log('❌ [WEBHOOK] External webhook failed:', response.status, response.statusText)
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    console.log('📥 [WEBHOOK] Parsing response JSON...')
    const data = await response.json()
    console.log('📦 [WEBHOOK] Response data keys:', Object.keys(data))
    
    // Process webhook response (expecting { output: string })
    const processedResponse = {
      response: data.output || 'Resposta vazia do webhook',
      post_content: null,
      is_final_post: false,
      suggestions: [],
      status: 'processing' as const,
    }
    
    console.log('✅ [WEBHOOK] Response processed in total time:', Date.now() - startTime, 'ms')
    console.log('💬 [WEBHOOK] Response preview:', processedResponse.response.substring(0, 100) + '...')
    
    // Return the processed response with proper CORS headers
    return NextResponse.json(processedResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('❌ [WEBHOOK] Failed after', totalTime, 'ms:', error)
    
    // Determine if it was a timeout error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' || 
      error.message.includes('timeout') ||
      totalTime >= 55000
    )
    
    console.error('🔍 [WEBHOOK] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      isTimeout,
      totalTime
    })
    
    // Return error response
    return NextResponse.json({
      response: isTimeout 
        ? 'O webhook externo demorou mais de 55 segundos para responder. Tente novamente ou verifique se o serviço está funcionando corretamente.'
        : 'Desculpe, não foi possível conectar ao serviço no momento. Verifique se o webhook está rodando.',
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro de conexão',
      timeout: isTimeout,
      elapsed_time: totalTime
    }, { 
      status: isTimeout ? 504 : 500,
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
