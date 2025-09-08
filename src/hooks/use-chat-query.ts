import { useMutation } from '@tanstack/react-query';
import { useChatStore } from '@/lib/store/chat-store';
import { useIdentity } from '@/lib/providers/identity-provider';
import { WebhookClient } from '@/lib/webhook/client';
import { ProcessedWebhookResponse } from '@/lib/types/webhook';

interface ChatResponse {
  message: string;
  resultPost?: string | undefined;
}

interface ChatRequest {
  message: string;
  conversationId: string;
}

export const useChatQuery = () => {
  const {
    messages,
    currentPost,
    isLoading,
    error,
    addMessage,
    setCurrentPost,
    setLoading,
    setError,
  } = useChatStore();

  const { identity } = useIdentity();
  const webhookClient = new WebhookClient();

  const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response: ProcessedWebhookResponse = await webhookClient.sendMessage({
        message: request.message,
        conversation_id: request.conversationId,
      });

      return {
        message: response.response,
        resultPost: response.post_content,
      };
    } catch (error) {
      throw new Error('Falha na comunicação com o servidor');
    }
  };

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Add assistant message
      addMessage({
        content: data.message,
        role: 'assistant',
      });

      // Update current post if provided
      if (data.resultPost) {
        setCurrentPost(data.resultPost);
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao enviar mensagem: ${errorMessage}`);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const sendMessage = async (content: string) => {
    if (!identity) {
      setError('Sistema de identificação não disponível');
      return;
    }

    // Add user message immediately
    addMessage({
      content,
      role: 'user',
    });

    // Send to API
    await chatMutation.mutateAsync({
      message: content,
      conversationId: identity.compositeId,
    });
  };

  return {
    messages,
    currentPost,
    isLoading,
    error,
    sendMessage,
    clearChat: useChatStore(state => state.clearChat),
  };
};