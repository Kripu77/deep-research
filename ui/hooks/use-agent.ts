'use client';

import { useEffect } from 'react';
import { useAgentStore } from '@/stores';

export function useAgents() {
  const { 
    agents, 
    isLoading, 
    error, 
    loadAgents
  } = useAgentStore();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return {
    agents,
    isLoading,
    error,
    loadAgents,
  };
}