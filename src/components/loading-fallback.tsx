import { Loader2, MessageSquare, FileText } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Carregando...</p>
          <p className="text-xs text-muted-foreground">
            Preparando sua experiência
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChatLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-primary mx-auto" />
          <Loader2 className="w-3 h-3 animate-spin text-primary absolute -top-1 -right-1" />
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando conversa...
        </p>
      </div>
    </div>
  );
}

export function PostPreviewLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="relative">
          <FileText className="w-6 h-6 text-primary mx-auto" />
          <Loader2 className="w-3 h-3 animate-spin text-primary absolute -top-1 -right-1" />
        </div>
        <p className="text-sm text-muted-foreground">
          Preparando preview...
        </p>
      </div>
    </div>
  );
}

// Skeleton components for better UX
export function MessageSkeleton() {
  return (
    <div className="flex gap-4 max-w-4xl mx-auto w-full animate-pulse">
      <div className="w-9 h-9 bg-muted rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}

export function PostPreviewSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      
      <div className="bg-muted rounded-xl p-6 space-y-3">
        <div className="h-4 bg-background rounded w-full" />
        <div className="h-4 bg-background rounded w-4/5" />
        <div className="h-4 bg-background rounded w-3/4" />
        <div className="h-4 bg-background rounded w-full" />
        <div className="h-4 bg-background rounded w-2/3" />
      </div>

      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
        <div className="h-6 bg-muted rounded-full w-12" />
      </div>
    </div>
  );
}