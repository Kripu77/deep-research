'use client';

import { useEffect } from 'react';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentStore } from '@/stores';
import { Agent } from '@/types';

interface AgentSelectorProps {
  selectedAgent: string | null;
  onAgentSelect: (agentName: string) => void;
}

export function AgentSelector({ selectedAgent, onAgentSelect }: AgentSelectorProps) {
  const { agents, isLoading, error, loadAgents } = useAgentStore();

  // Load agents when component mounts
  useEffect(() => {
    loadAgents();
  }, []); // Remove loadAgents from dependencies to prevent infinite loop

  const handleAgentSelect = (agent: Agent) => {
    onAgentSelect(agent.name);
  };

  const formatAgentName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str: string) => str.toUpperCase())
      .trim();
  };

  const getAgentIcon = (agentName: string) => {
    // You can customize icons based on agent type
    return <Bot className="h-4 w-4" />;
  };

  const getAgentColor = (agentName: string) => {
    const colors = {
      researchAgent: 'bg-blue-500/10 text-blue-700 border-blue-200',
      streamingResearchAgent: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      reportAgent: 'bg-green-500/10 text-green-700 border-green-200',
      evaluationAgent: 'bg-purple-500/10 text-purple-700 border-purple-200',
      learningExtractionAgent: 'bg-orange-500/10 text-orange-700 border-orange-200',
    };
    return colors[agentName as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading agents...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <div>
                <p className="text-sm font-medium">Failed to load agents</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAgents}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadAgents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {agents.map((agent: Agent) => (
              <div
                key={agent.name}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedAgent === agent.name
                    ? 'ring-2 ring-primary ring-offset-2 bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleAgentSelect(agent)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${getAgentColor(agent.name)}`}>
                    {getAgentIcon(agent.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {formatAgentName(agent.name)}
                      </h3>
                      {selectedAgent === agent.name && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    {agent.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}