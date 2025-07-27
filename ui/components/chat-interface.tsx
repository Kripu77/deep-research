'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/stores';
import type { Message } from '@/types';
import { MarkdownText } from './markdown-text';

interface ChatInterfaceProps {
  agentName: string;
  agentDisplayName?: string;
  agentDescription?: string | undefined;
}

export function ChatInterface({ agentName, agentDisplayName, agentDescription }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const { 
    messages, 
    isLoading, 
    error,
    sendMessage, 
    clearMessages
  } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear messages when agent changes
  useEffect(() => {
    if (agentName) {
      clearMessages();
    }
  }, [agentName, clearMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !agentName) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message, agentName);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const formatAgentName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getDisplayName = () => {
    return agentDisplayName || formatAgentName(agentName);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex gap-3 p-4 ${isUser ? 'bg-muted/30' : 'bg-background'}`}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isUser ? 'You' : (message.agentName ? formatAgentName(message.agentName) : getDisplayName())}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
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
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {getDisplayName()}
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
              onClick={clearMessages}
              disabled={isLoading || messages.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="min-h-full">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Ask {getDisplayName()} anything. This agent specializes in{' '}
                    {agentDescription?.toLowerCase() || 'helping with various tasks'}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map(renderMessage)}
              </div>
            )}
            
            {isLoading && (
              <div className="flex gap-3 p-4 bg-background">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-secondary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getDisplayName()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Thinking...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing your request...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {error && (
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message ${getDisplayName()}...`}
              disabled={isLoading}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}