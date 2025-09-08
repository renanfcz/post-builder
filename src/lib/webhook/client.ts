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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ProcessedWebhookResponse = await response.json();
        return data;

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

  updateConfig(newConfig: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
