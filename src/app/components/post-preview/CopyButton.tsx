'use client';

import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export const CopyButton = ({ text, disabled = false }: CopyButtonProps) => {
  const { copied, copy } = useClipboard(2000);

  const handleCopy = async () => {
    if (!text.trim() || disabled) return;
    await copy(text);
  };

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !text.trim()}
      className="w-full"
      size="lg"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copiar para Clipboard
        </>
      )}
    </Button>
  );
};