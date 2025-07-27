'use client';

import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MarkdownText } from '@/components/markdown-text';
import { cn } from '@/lib/utils';
import type { MessageProps } from '@/types/components';

function formatAgentName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export function Message({ 
  message, 
  agentName, 
  isStreaming = false,
  className 
}: MessageProps): JSX.Element {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-muted/30' : 'bg-background',
        className
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback 
          className={isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary'
          }
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'You' : formatAgentName(message.agentName || agentName)}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {isStreaming && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-blue-600">Typing...</span>
            </div>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <MarkdownText>{message.content}</MarkdownText>
          )}
        </div>
        
        {message.metadata && (
          <div className="text-xs text-muted-foreground space-y-1">
            {message.metadata.processingTime && (
              <div>Processing time: {message.metadata.processingTime}ms</div>
            )}
            {message.metadata.tokens && (
              <div>Tokens: {message.metadata.tokens}</div>
            )}
            {message.metadata.sources && message.metadata.sources.length > 0 && (
              <div>
                Sources: {message.metadata.sources.slice(0, 3).join(', ')}
                {message.metadata.sources.length > 3 && ` +${message.metadata.sources.length - 3} more`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}