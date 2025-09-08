'use client';

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/lib/utils';

export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

export const useClipboard = (resetDelay: number = 2000): UseClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    const success = await copyToClipboard(text);
    setCopied(success);
    
    if (success && resetDelay > 0) {
      setTimeout(() => setCopied(false), resetDelay);
    }
    
    return success;
  }, [resetDelay]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copied, copy, reset };
};