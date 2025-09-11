import { WEBHOOK_CONFIG } from '../constants';
import { ProcessedWebhookResponse, WebhookConfig, WebhookRequest } from '../types/webhook';
import { logger, LogLevel } from '../logger';

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

        logger.webhook(LogLevel.INFO, 'Webhook accepted request for conversation', {
          conversationId: request.conversation_id,
          attempt,
          metadata: { url: this.config.url }
        });

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
    const pollInterval = 2 * 1000; // 10 seconds as requested

    logger.polling(LogLevel.INFO, 'Starting polling for conversation', {
      conversationId,
      metadata: { 
        maxDuration: maxDuration / 1000, // in seconds
        pollInterval: pollInterval / 1000 // in seconds
      }
    });

    while (Date.now() - startTime < maxDuration) {
      try {
        // Poll external backend Redis
        const pollUrl = process.env.NEXT_PUBLIC_BACKEND_POLL_URL;
        if (!pollUrl) {
          throw new Error('NEXT_PUBLIC_BACKEND_POLL_URL não configurado');
        }
        const checkUrl = `${pollUrl}?conversation_id=${conversationId}`;
        const response = await fetch(checkUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Try to parse as JSON first
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          // If not JSON, treat as plain text
          responseData = responseText;
        }

        // Check if processing is complete
        const isComplete =
          (responseData && typeof responseData === 'string' && responseData.trim()) ||
          (typeof responseData === 'object' &&
            responseData.response !== null &&
            responseData.response !== undefined);

        if (isComplete) {
          console.log(`✅ [POLLING] Conversation completed after ${pollCount + 1} polls`);

          // Clean up Redis key by calling DELETE endpoint
          try {
            const cleanupUrl = process.env.NEXT_PUBLIC_BACKEND_CLEANUP_URL;
            if (!cleanupUrl) {
              console.warn('⚠️ [CLEANUP] NEXT_PUBLIC_BACKEND_CLEANUP_URL não configurado');
              return {
                response: responseText.trim(),
                status: 'completed',
                conversation_id: conversationId,
              };
            }

            await fetch(cleanupUrl, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ conversation_id: conversationId }),
            });
            console.log(`🧹 [CLEANUP] Redis key cleaned for conversation: ${conversationId}`);
          } catch (cleanupError) {
            console.warn(`⚠️ [CLEANUP] Failed to clean Redis key:`, cleanupError);
          }

          // Extract the actual response message
          const finalResponse =
            typeof responseData === 'string' ? responseData.trim() : responseData.response;

          return {
            response: finalResponse,
            status: 'completed',
            conversation_id: conversationId,
          };
        }

        // Response indicates still processing (null response or empty)
        const elapsed = Date.now() - startTime;
        const statusMessage =
          typeof responseData === 'object' && responseData.response === null
            ? 'response: null - still processing...'
            : 'empty response - still processing...';
        console.log(
          `🔄 [POLLING] Poll ${pollCount + 1}, elapsed: ${Math.round(elapsed / 1000)}s - ${statusMessage}`
        );

        pollCount++;

        // Wait 10 seconds before next poll
        if (Date.now() - startTime < maxDuration) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
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
        await new Promise(resolve => setTimeout(resolve, pollInterval));
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
