'use client';

import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { Message } from './message';
import { cn } from '@/lib/utils';
import type { MessageListProps } from '@/types/components';

function formatAgentName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function LoadingMessage({ agentName }: { readonly agentName: string }): JSX.Element {
  return (
    <div className="flex gap-3 p-4 bg-background">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatAgentName(agentName)}
          </span>
          <Badge variant="secondary" className="text-xs">
            Thinking...
          </Badge>
        </div>
        <LoadingSpinner size="sm" text="Processing your request..." />
      </div>
    </div>
  );
}

export function MessageList({ 
  messages, 
  agentName, 
  isLoading = false,
  className 
}: MessageListProps): JSX.Element {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className={cn('flex-1', className)}>
        <EmptyState
          icon={<Bot className="h-12 w-12" />}
          title="Start a conversation"
          description={`Ask ${formatAgentName(agentName)} anything. This agent specializes in helping with various research tasks.`}
        />
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="min-h-full">
        <div className="divide-y">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              agentName={agentName}
              isStreaming={false}
            />
          ))}
        </div>
        
        {isLoading && <LoadingMessage agentName={agentName} />}
      </div>
    </ScrollArea>
  );
}