'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputArea = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Digite sua mensagem sobre o post do LinkedIn...'
}: InputAreaProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[60px] max-h-[120px] resize-none"
        rows={2}
      />
      
      <Button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        size="icon"
        className="h-[60px] w-12 shrink-0"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Enviar mensagem</span>
      </Button>
    </div>
  );
};