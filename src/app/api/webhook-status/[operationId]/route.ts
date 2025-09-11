import { NextRequest, NextResponse } from 'next/server'
import { asyncOperationStore } from '@/lib/async-operations'

export async function GET(
  request: NextRequest,
  { params }: { params: { operationId: string } }
) {
  try {
    const { operationId } = params
    
    console.log('🔍 [WEBHOOK-STATUS] Checking status for:', operationId)
    
    const operation = asyncOperationStore.get(operationId)
    
    if (!operation) {
      console.log('❌ [WEBHOOK-STATUS] Operation not found:', operationId)
      return NextResponse.json({
        status: 'not_found',
        error: 'Operação não encontrada ou expirada'
      }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Check if operation is too old (5 minutes)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    if (now - operation.startTime > fiveMinutes) {
      asyncOperationStore.delete(operationId)
      return NextResponse.json({
        status: 'expired',
        error: 'Operação expirada'
      }, { 
        status: 410,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    console.log('📊 [WEBHOOK-STATUS] Operation status:', operation.status)

    if (operation.status === 'completed' && operation.result) {
      // Clean up completed operation
      asyncOperationStore.delete(operationId)
      
      return NextResponse.json({
        status: 'completed',
        ...operation.result
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (operation.status === 'error') {
      // Clean up failed operation
      asyncOperationStore.delete(operationId)
      
      return NextResponse.json({
        status: 'error',
        error: operation.error || 'Erro desconhecido'
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Still pending
    return NextResponse.json({
      status: 'pending',
      elapsed_time: now - operation.startTime,
      message: 'Processando solicitação...'
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