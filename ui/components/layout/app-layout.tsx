'use client';

import type { ReactNode } from 'react';
import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  readonly children: ReactNode;
  readonly className?: string;
}

interface AppHeaderProps {
  readonly agentCount?: number;
}

function AppHeader({ agentCount = 0 }: AppHeaderProps): JSX.Element {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Deep Research Assistant</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered research with specialized agents
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {agentCount} Agents Available
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

function AppMain({ children, className }: AppLayoutProps): JSX.Element {
  return (
    <main className={cn('container mx-auto px-4 py-6', className)}>
      {children}
    </main>
  );
}

export function AppLayout({ children, className }: AppLayoutProps): JSX.Element {
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-background to-muted/20', className)}>
      <ErrorBoundary>
        <AppHeader />
        <AppMain>{children}</AppMain>
      </ErrorBoundary>
    </div>
  );
}

// Export sub-components for flexibility
AppLayout.Header = AppHeader;
AppLayout.Main = AppMain;