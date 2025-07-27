'use client';

import { useState, useRef, type FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types/components';

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type your message...',
  disabled = false,
  className,
}: ChatInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || disabled) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await onSendMessage(message);
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to send message:', error);
    }
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const isSubmitDisabled = isLoading || disabled || !inputValue.trim();

  return (
    <div className={cn('border-t p-4', className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className="flex-1"
          autoFocus
        />
        <Button 
          type="submit" 
          disabled={isSubmitDisabled}
          size="default"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}