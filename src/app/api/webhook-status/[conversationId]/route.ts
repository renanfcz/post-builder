import { NextRequest, NextResponse } from 'next/server'
import { asyncOperationStore } from '@/lib/async-operations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    
    console.log('🔍 [WEBHOOK-STATUS] Checking status for conversation_id:', conversationId)
    console.log('📦 [WEBHOOK-STATUS] Store size:', asyncOperationStore.size())
    
    const conversation = asyncOperationStore.get(conversationId)
    console.log('📝 [WEBHOOK-STATUS] Conversation found:', conversation ? 'YES' : 'NO')
    
    if (!conversation) {
      console.log('❌ [WEBHOOK-STATUS] Conversation not found:', conversationId)
      return NextResponse.json({
        status: 'not_found',
        error: 'Conversa não encontrada ou expirada'
      }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Check if conversation is too old (5 minutes)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    if (now - conversation.startTime > fiveMinutes) {
      asyncOperationStore.delete(conversationId)
      return NextResponse.json({
        status: 'expired',
        error: 'Conversa expirada'
      }, { 
        status: 410,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    console.log('📊 [WEBHOOK-STATUS] Conversation status:', conversation.status)

    if (conversation.status === 'completed' && conversation.result) {
      // Don't clean up immediately - let cleanup() handle it after 5 minutes
      // This allows multiple polling requests to get the result
      
      return NextResponse.json({
        status: 'completed',
        ...conversation.result
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (conversation.status === 'error') {
      // Don't clean up immediately - let cleanup() handle it
      // This allows the frontend to retry if needed
      
      return NextResponse.json({
        status: 'error',
        error: conversation.error || 'Erro desconhecido'
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Still pending - waiting for webhook notification
    return NextResponse.json({
      status: 'pending',
      elapsed_time: now - conversation.startTime,
      message: 'Aguardando processamento...'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ [WEBHOOK-STATUS] Error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}