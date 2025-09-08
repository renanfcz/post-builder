'use client';

import { Suspense, useState } from 'react';
import { ChatInterface, PostPreview } from './components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useChatQuery } from '@/hooks/use-chat-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { 
  ChatLoadingFallback, 
  PostPreviewLoadingFallback 
} from '@/components/loading-fallback';

export default function Home() {
  const { 
    hasStartedChat, 
    currentPost, 
    setHasStartedChat 
  } = useChatStore();

  const { sendMessage } = useChatQuery();

  const handleStartChat = async (message: string) => {
    if (message.trim()) {
      setHasStartedChat(true);
      // Enviar a mensagem inicial
      await sendMessage(message);
    }
  };

  if (!hasStartedChat) {
    return <InitialScreen onStartChat={handleStartChat} />;
  }

  return (
    <div className="min-h-screen bg-background transition-all duration-700 ease-in-out">
      <div className={`flex h-screen transition-all duration-700 ease-in-out ${
        currentPost ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex-col'
      }`}>
        {/* Chat Area */}
        <div className="flex flex-col h-full animate-in slide-in-from-top duration-700">
          <ErrorBoundary>
            <Suspense fallback={<ChatLoadingFallback />}>
              <ChatInterface />
            </Suspense>
          </ErrorBoundary>
        </div>
        
        {/* Post Preview - Only show when we have a post */}
        {currentPost && (
          <div className="h-full animate-in slide-in-from-right duration-700">
            <ErrorBoundary>
              <Suspense fallback={<PostPreviewLoadingFallback />}>
                <PostPreview content={currentPost} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}

function InitialScreen({ onStartChat }: { onStartChat: (message: string) => Promise<void> }) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onStartChat(inputValue);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleButtonClick = async () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onStartChat(inputValue);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary/50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-1000">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Post Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Crie posts incríveis para o LinkedIn com a ajuda da inteligência artificial
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-xl mx-auto space-y-4 animate-in slide-in-from-bottom duration-1000 delay-300">
          <div className="relative">
            <Input
              type="text"
              placeholder="Descreva o post que você quer criar..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pr-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/70"
            />
            <Button
              onClick={handleButtonClick}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="absolute right-2 top-2 h-10 w-10 p-0 bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Post sobre conquista profissional",
              "Dica de carreira",
              "Reflexão sobre liderança",
              "Anúncio de produto"
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(suggestion)}
                className="text-sm bg-card/30 backdrop-blur-sm border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
