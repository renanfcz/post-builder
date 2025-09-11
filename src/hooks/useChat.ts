'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, ChatState } from '@/lib/types';
import { useWebhook } from './useWebhook';
import { CHAT_CONFIG } from '@/lib/constants';

export interface UseChatReturn extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  currentPost: string | null;
  progressMessage: string | null;
}

export const useChat = (webhookUrl?: string): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<string | null>(null);
  
  const { sendMessage: sendWebhookMessage, progressMessage } = useWebhook(webhookUrl);
  const conversationIdRef = useRef<string>(crypto.randomUUID());

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Keep only the latest messages within the limit
      return updated.slice(-CHAT_CONFIG.MAX_MESSAGES);
    });
    
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    addMessage({
      content: content.trim(),
      role: 'user',
    });

    try {
      // Send to webhook with conversation context
      const context = {
        conversation_id: conversationIdRef.current,
        message_history: messages.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      };

      const response = await sendWebhookMessage(content, context);

      // Add assistant response
      addMessage({
        content: response.response,
        role: 'assistant',
      });

      // Update current post if provided
      if (response.post_content) {
        setCurrentPost(response.post_content);
      }

      if (response.status === 'error') {
        setError(response.error || 'Erro desconhecido');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      
      // Add error message
      addMessage({
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        role: 'assistant',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, messages, sendWebhookMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentPost(null);
    setError(null);
    conversationIdRef.current = crypto.randomUUID();
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentPost,
    sendMessage,
    clearChat,
    progressMessage,
  };
};