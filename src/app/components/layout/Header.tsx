'use client';

import { Linkedin, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Linkedin className="h-6 w-6" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold">Post Builder</h1>
            <p className="text-sm text-muted-foreground">
              Crie posts incríveis para o LinkedIn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};