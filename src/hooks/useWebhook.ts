'use client';

import { useState, useCallback, useRef } from 'react';
import { WebhookClient } from '@/lib/webhook';
import { WebhookRequest, ProcessedWebhookResponse } from '@/lib/types';

export interface UseWebhookReturn {
  sendMessage: (message: string, context?: Record<string, any>) => Promise<ProcessedWebhookResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  progressMessage: string | null;
}

export const useWebhook = (webhookUrl?: string): UseWebhookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const clientRef = useRef<WebhookClient | undefined>(undefined);

  // Initialize or update webhook client
  if (!clientRef.current || (webhookUrl && clientRef.current)) {
    clientRef.current = new WebhookClient(webhookUrl ? { url: webhookUrl } : {});
  }

  const sendMessage = useCallback(async (
    message: string, 
  ): Promise<ProcessedWebhookResponse> => {
    if (!clientRef.current) {
      throw new Error('Webhook client not initialized');
    }

    setIsLoading(true);
    setError(null);
    setProgressMessage('Enviando mensagem...');

    try {
      const request: WebhookRequest = {
        message,
        conversation_id: crypto.randomUUID(),
      };

      // Create a custom client with progress callbacks
      const progressClient = new WebhookClient(webhookUrl ? { url: webhookUrl } : {});
      
      // Start the async operation
      setProgressMessage('Processando com IA...');
      const response = await progressClient.sendMessage(request);
      
      if (response.status === 'error') {
        setError(response.error || 'Erro desconhecido');
        setProgressMessage(null);
      } else if (response.status === 'completed') {
        setProgressMessage('Concluído!');
        // Clear progress message after a brief moment
        setTimeout(() => setProgressMessage(null), 1000);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      setProgressMessage(null);
      
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
    setProgressMessage(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    clearError,
    progressMessage,
  };
};
