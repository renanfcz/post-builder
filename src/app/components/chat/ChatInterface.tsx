'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useChatQuery } from '@/hooks/use-chat-query';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
// import { LoadingIndicator } from './LoadingIndicator';
import { MessageSkeleton } from '@/components/loading-fallback';
import { AlertCircle } from 'lucide-react';

export const ChatInterface = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChatQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-card/30 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold">Post Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Criando seu post do LinkedIn com IA
          </p>
        </div>
        
        {messages.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            disabled={isLoading}
            className="bg-card/50 backdrop-blur-sm"
          >
            Nova conversa
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <div className="max-w-md mx-auto">
              <p className="text-lg mb-2">💬 Vamos começar!</p>
              <p className="text-sm">
                Digite sua mensagem abaixo para criar um post incrível
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <MessageSkeleton />
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg max-w-2xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-6 border-t bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <InputArea 
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};