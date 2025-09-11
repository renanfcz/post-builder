import { WebhookRequest, ProcessedWebhookResponse, WebhookConfig } from '../types/webhook';
import { WEBHOOK_CONFIG } from '../constants';

export class WebhookClient {
  private config: WebhookConfig;

  constructor(config: Partial<WebhookConfig> = {}) {
    this.config = {
      url: config.url || WEBHOOK_CONFIG.DEFAULT_URL,
      timeout: config.timeout || WEBHOOK_CONFIG.TIMEOUT,
      retries: config.retries || WEBHOOK_CONFIG.RETRIES,
    };
  }

  async sendMessage(request: WebhookRequest): Promise<ProcessedWebhookResponse> {
    if (!request.conversation_id) {
      throw new Error('conversation_id é obrigatório');
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        // Call the async webhook endpoint (should return HTTP 200 only)
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log(`✅ [WEBHOOK-CLIENT] Webhook accepted request for conversation: ${request.conversation_id}`);
        
        // Start polling immediately using conversation_id
        return await this.pollForResult(request.conversation_id);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`❌ [WEBHOOK-CLIENT] Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.config.retries!) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.log(`🔄 [WEBHOOK-CLIENT] Retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    // All retries failed
    return {
      response: 'Desculpe, não foi possível conectar ao serviço no momento. Tente novamente.',
      status: 'error',
      error: lastError!.message,
      conversation_id: request.conversation_id,
    };
  }

  private async pollForResult(conversationId: string): Promise<ProcessedWebhookResponse> {
    const maxDuration = 3 * 60 * 1000; // 3 minutes total
    const startTime = Date.now();
    let pollCount = 0;
    
    // Adaptive polling intervals: 1s -> 2s -> 3s -> 3s...
    const getPollInterval = (count: number): number => {
      if (count < 5) return 1000;      // First 5 polls: 1 second
      if (count < 15) return 2000;     // Next 10 polls: 2 seconds  
      return 3000;                     // Rest: 3 seconds
    };
    
    while (Date.now() - startTime < maxDuration) {
      try {
        const response = await fetch(`/api/webhook-status/${conversationId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          console.log(`✅ [POLLING] Conversation completed after ${pollCount + 1} polls`);
          return {
            response: data.response,
            post_content: data.post_content,
            is_final_post: data.is_final_post,
            suggestions: data.suggestions || [],
            status: 'completed',
            conversation_id: conversationId,
          };
        }
        
        if (data.status === 'error' || data.status === 'not_found' || data.status === 'expired') {
          console.log(`❌ [POLLING] Conversation failed: ${data.status}`);
          
          // Provide more specific error messages
          let errorMessage = 'Erro ao processar sua mensagem. Tente novamente.';
          if (data.status === 'not_found') {
            errorMessage = 'Conversa não encontrada. A sessão pode ter expirado.';
          } else if (data.status === 'expired') {
            errorMessage = 'Conversa expirou. Tente enviar a mensagem novamente.';
          } else if (data.error?.includes('timeout')) {
            errorMessage = 'O processamento está demorando mais que o esperado. Tente novamente com uma mensagem mais simples.';
          }
          
          return {
            response: errorMessage,
            status: 'error',
            error: data.error || 'Conversa falhou',
            conversation_id: conversationId,
          };
        }
        
        // Still pending - log progress and continue
        const elapsed = Date.now() - startTime;
        console.log(`🔄 [POLLING] Poll ${pollCount + 1}, elapsed: ${Math.round(elapsed/1000)}s`);
        
        pollCount++;
        const pollInterval = getPollInterval(pollCount);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
      } catch (error) {
        console.error(`❌ [POLLING] Error on poll ${pollCount + 1}:`, error);
        pollCount++;
        
        // If we've exhausted time, return error
        if (Date.now() - startTime >= maxDuration) {
          return {
            response: 'Erro ao verificar status da operação.',
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro de polling',
          };
        }
        
        // Otherwise, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Timeout reached
    console.log(`⏰ [POLLING] Timeout after ${pollCount} polls`);
    return {
      response: 'A operação está demorando mais que o esperado. Tente novamente.',
      status: 'error',
      error: 'Timeout na operação',
    };
  }

  updateConfig(newConfig: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
