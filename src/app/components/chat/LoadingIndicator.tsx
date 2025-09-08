'use client';

import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator = ({ message = 'Pensando...' }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
};