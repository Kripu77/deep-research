'use client';

import { useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { AgentProgress } from './agent-progress';
import { useChatMessages, useChatActions } from '@/stores/chat-store';
import { cn } from '@/lib/utils';
import type { ChatInterfaceProps } from '@/types/components';

function formatAgentName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str: string) => str.toUpperCase())
    .trim();
}

function getDisplayName(agentName: string, agentDisplayName?: string): string {
  return agentDisplayName || formatAgentName(agentName);
}

export function ChatInterface({ 
  agentName, 
  agentDisplayName,
  agentDescription,
  className,
}: Omit<ChatInterfaceProps, 'messages' | 'isLoading' | 'error' | 'onSendMessage' | 'onClearMessages'>): JSX.Element {
  const { messages, isLoading, error } = useChatMessages();
  const { sendMessage, clearMessages, startNewSession } = useChatActions();

  // Start new session when agent changes
  useEffect(() => {
    if (agentName) {
      startNewSession(agentName);
    }
  }, [agentName, startNewSession]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, agentName);
  };

  const handleClearMessages = () => {
    clearMessages();
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>{getDisplayName(agentName, agentDisplayName)}</span>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </CardTitle>
            {agentDescription && (
              <p className="text-sm text-muted-foreground mt-1">
                {agentDescription}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMessages}
              disabled={isLoading || messages.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <AgentProgress className="mx-4 mt-4" />
        
        <MessageList 
          messages={messages}
          agentName={agentName}
          isLoading={isLoading}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={`Message ${getDisplayName(agentName, agentDisplayName)}...`}
        />
      </CardContent>
    </Card>
  );
}