'use client';

import { Message } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-4 max-w-4xl mx-auto w-full',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full shadow-sm',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-accent text-accent-foreground border border-border'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className={cn(
          'rounded-2xl px-4 py-3 shadow-sm',
          isUser 
            ? 'bg-primary text-primary-foreground ml-8' 
            : 'bg-card text-card-foreground border border-border mr-8'
        )}>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className={cn(
          'text-xs text-muted-foreground px-2',
          isUser ? 'text-right ml-8' : 'text-left mr-8'
        )}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};