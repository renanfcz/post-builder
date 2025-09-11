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
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        // Start the async operation
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

        const data = await response.json();
        
        // Check if this is an async response with operation_id
        if (data.operation_id && data.status === 'processing') {
          // Poll for the result
          return await this.pollForResult(data.operation_id);
        }
        
        // Direct response (fallback for sync endpoint)
        return data as ProcessedWebhookResponse;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retries!) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    return {
      response: 'Desculpe, não foi possível conectar ao serviço no momento. Tente novamente.',
      status: 'error',
      error: lastError!.message,
    };
  }

  private async pollForResult(operationId: string): Promise<ProcessedWebhookResponse> {
    const maxPolls = 60; // 2 minutes with 2s intervals
    const pollInterval = 2000; // 2 seconds
    
    for (let poll = 0; poll < maxPolls; poll++) {
      try {
        const response = await fetch(`/api/webhook-status/${operationId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          return {
            response: data.response,
            post_content: data.post_content,
            is_final_post: data.is_final_post,
            suggestions: data.suggestions || [],
            status: 'completed',
          };
        }
        
        if (data.status === 'error' || data.status === 'not_found' || data.status === 'expired') {
          return {
            response: 'Erro ao processar sua mensagem. Tente novamente.',
            status: 'error',
            error: data.error || 'Operação falhou',
          };
        }
        
        // Still pending, wait and poll again
        if (poll < maxPolls - 1) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling unless it's the last attempt
        if (poll === maxPolls - 1) {
          return {
            response: 'Erro ao verificar status da operação.',
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro de polling',
          };
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    // Timeout reached
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
