'use client';

import { Badge } from '@/components/ui/badge';
import { CopyButton } from './CopyButton';
import { extractHashtags } from '@/lib/utils';
import { FileText, Hash } from 'lucide-react';

interface PostPreviewProps {
  content: string | null;
  title?: string;
}

export const PostPreview = ({ 
  content, 
  title = 'Preview do Post' 
}: PostPreviewProps) => {
  if (!content) {
    return null;
  }

  const hashtags = extractHashtags(content);
  const characterCount = content.length;
  const isLongPost = characterCount > 1300;

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="p-6 border-b bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{characterCount} caracteres</span>
          {hashtags.length > 0 && (
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>{hashtags.length} hashtags</span>
            </div>
          )}
          <Badge variant={isLongPost ? 'destructive' : 'secondary'} className="text-xs">
            {isLongPost ? 'Longo' : 'Tamanho OK'}
          </Badge>
        </div>
      </div>

      {/* Content preview */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </div>
        </div>

        {/* Hashtags display */}
        {hashtags.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-3 text-foreground">Hashtags encontradas:</p>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Character count warning */}
        {isLongPost && (
          <div className="mt-6 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-sm text-destructive">
              ⚠️ Post muito longo. O LinkedIn favorece posts mais concisos.
              Considere reduzir para menos de 1300 caracteres.
            </p>
          </div>
        )}
      </div>

      {/* Copy button */}
      <div className="p-6 border-t bg-card/30 backdrop-blur-sm">
        <CopyButton text={content} />
      </div>
    </div>
  );
};
