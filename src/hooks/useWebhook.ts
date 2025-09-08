'use client';

import { useState, useCallback, useRef } from 'react';
import { WebhookClient } from '@/lib/webhook';
import { WebhookRequest, WebhookResponse } from '@/lib/types';

export interface UseWebhookReturn {
  sendMessage: (message: string, context?: Record<string, any>) => Promise<WebhookResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useWebhook = (webhookUrl?: string): UseWebhookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<WebhookClient>();

  // Initialize or update webhook client
  if (!clientRef.current || (webhookUrl && clientRef.current)) {
    clientRef.current = new WebhookClient(webhookUrl ? { url: webhookUrl } : {});
  }

  const sendMessage = useCallback(async (
    message: string, 
  ): Promise<WebhookResponse> => {
    if (!clientRef.current) {
      throw new Error('Webhook client not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: WebhookRequest = {
        message,
        conversation_id: crypto.randomUUID(),
      };

      const response = await clientRef.current.sendMessage(request);
      
      if (response.status === 'error') {
        setError(response.error || 'Erro desconhecido');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      
      return {
        response: 'Erro ao processar sua mensagem. Tente novamente.',
        status: 'error',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    clearError,
  };
};
