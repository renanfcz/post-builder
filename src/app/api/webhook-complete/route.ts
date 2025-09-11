import { NextRequest, NextResponse } from 'next/server'
import { asyncOperationStore } from '@/lib/async-operations'

export async function POST(request: NextRequest) {
  try {
    console.log('📬 [WEBHOOK-COMPLETE] Notification received at:', new Date().toISOString())
    
    const body = await request.json()
    console.log('📝 [WEBHOOK-COMPLETE] Notification body:', {
      conversation_id: body.conversation_id,
      message: body.message
    })
    
    // Validate notification body
    if (!body.conversation_id) {
      console.log('❌ [WEBHOOK-COMPLETE] Validation failed - missing conversation_id')
      return NextResponse.json(
        { error: 'conversation_id é obrigatório' },
        { status: 400 }
      )
    }

    const conversationId = body.conversation_id
    
    // Check if conversation exists in our store
    const existingConversation = asyncOperationStore.get(conversationId)
    if (!existingConversation) {
      console.log('❌ [WEBHOOK-COMPLETE] Conversation not found:', conversationId)
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    // Process the simple notification format
    if (body.message) {
      console.log('✅ [WEBHOOK-COMPLETE] Conversation completed:', conversationId)
      console.log('📝 [WEBHOOK-COMPLETE] Message received:', body.message)
      
      // Store the completed result using the message as response
      asyncOperationStore.set(conversationId, {
        status: 'completed',
        result: {
          response: body.message,
          status: 'completed' as const,
        },
        startTime: existingConversation.startTime // Preserve original start time
      })
      
    } else {
      console.log('❌ [WEBHOOK-COMPLETE] Missing message in notification')
      return NextResponse.json(
        { error: 'message é obrigatório' },
        { status: 400 }
      )
    }

    console.log('💾 [WEBHOOK-COMPLETE] Conversation status updated:', conversationId)
    
    // Return success response to webhook
    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message: 'Status atualizado com sucesso'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    console.error('❌ [WEBHOOK-COMPLETE] Processing failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
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