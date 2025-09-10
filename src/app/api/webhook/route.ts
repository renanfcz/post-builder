import { NextRequest, NextResponse } from 'next/server'
import { WEBHOOK_CONFIG } from '@/lib/constants'

// Configure route timeout to 60 seconds
export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: any = { message: 'mensagem vazia' }
  
  try {
    body = await request.json()
    
    // Validate request body
    if (!body.message || !body.conversation_id) {
      return NextResponse.json(
        { error: 'Mensagem e conversation_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Forward request to actual webhook
    const webhookUrl = WEBHOOK_CONFIG.EXTERNAL_URL
    
    console.log('🔗 Calling webhook:', webhookUrl)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secret: process.env.NEXT_PUBLIC_SECRET || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000), // 55 seconds timeout for the fetch
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process webhook response (expecting { output: string })
    const processedResponse = {
      response: data.output || 'Resposta vazia do webhook',
      post_content: null,
      is_final_post: false,
      suggestions: [],
      status: 'processing' as const,
    }
    
    console.log('✅ Webhook response processed:', processedResponse.response.substring(0, 100) + '...')
    
    // Return the processed response with proper CORS headers
    return NextResponse.json(processedResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('❌ Webhook failed:', error)
    
    // Return error response
    return NextResponse.json({
      response: 'Desculpe, não foi possível conectar ao serviço no momento. Verifique se o webhook está rodando.',
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
