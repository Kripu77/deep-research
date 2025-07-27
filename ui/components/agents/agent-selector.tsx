'use client';

import { useEffect } from 'react';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { AgentCard } from './agent-card';
import { useAgentList, useAgentSelection } from '@/stores/agent-store';
import type { AgentSelectorProps } from '@/types/components';
import type { Agent } from '@/types';

export function AgentSelector({ 
  className,
  onAgentSelect,
  onRefresh,
}: Omit<AgentSelectorProps, 'agents' | 'selectedAgent' | 'isLoading' | 'error'>): JSX.Element {
  const { agents, isLoading, error, loadAgents } = useAgentList();
  const { selectedAgent, selectAgent } = useAgentSelection();

  // Load agents when component mounts
  useEffect(() => {
    if (agents.length === 0 && !isLoading && !error) {
      loadAgents();
    }
  }, [agents.length, isLoading, error, loadAgents]);

  const handleAgentSelect = (agent: Agent) => {
    selectAgent(agent);
    onAgentSelect?.(agent);
  };

  const handleRefresh = async () => {
    await loadAgents();
    onRefresh?.();
  };

  if (isLoading && agents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Loading agents..." />
        </CardContent>
      </Card>
    );
  }

  if (error && agents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<AlertCircle className="h-8 w-8" />}
            title="Failed to load agents"
            description={error}
            action={{
              label: "Retry",
              onClick: handleRefresh,
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Bot className="h-8 w-8" />}
            title="No agents available"
            description="No AI agents are currently configured. Please check your configuration."
            action={{
              label: "Refresh",
              onClick: handleRefresh,
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {agents.map((agent: Agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onClick={() => handleAgentSelect(agent)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}