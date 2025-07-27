'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores';

export function useChat(agentName?: string) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    startNewSession,
  } = useChatStore();

  useEffect(() => {
    if (agentName) {
      startNewSession(agentName);
    }
  }, [agentName, startNewSession]);

  const handleSendMessage = async (content: string) => {
    if (agentName) {
      await sendMessage(content, agentName);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage: handleSendMessage,
    clearMessages,
  };
}