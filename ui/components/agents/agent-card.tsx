'use client';

import { Bot, Zap, Search, Brain, FileText, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';
import type { AgentCardProps } from '@/types/components';

const AGENT_ICONS = {
  researchAgent: Search,
  streamingResearchAgent: Zap,
  reportAgent: FileText,
  evaluationAgent: Brain,
  learningExtractionAgent: Target,
} as const;

const AGENT_COLORS = {
  researchAgent: 'bg-blue-500/10 text-blue-700 border-blue-200',
  streamingResearchAgent: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
  reportAgent: 'bg-green-500/10 text-green-700 border-green-200',
  evaluationAgent: 'bg-purple-500/10 text-purple-700 border-purple-200',
  learningExtractionAgent: 'bg-orange-500/10 text-orange-700 border-orange-200',
} as const;

function getAgentIcon(agentName: string): React.ComponentType<{ className?: string }> {
  return AGENT_ICONS[agentName as keyof typeof AGENT_ICONS] || Bot;
}

function getAgentColor(agentName: string): string {
  return AGENT_COLORS[agentName as keyof typeof AGENT_COLORS] || 'bg-gray-500/10 text-gray-700 border-gray-200';
}

function formatAgentName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function getDisplayName(agent: Agent): string {
  return agent.displayName || formatAgentName(agent.name);
}

export function AgentCard({ 
  agent, 
  isSelected, 
  onClick, 
  className 
}: AgentCardProps): JSX.Element {
  const IconComponent = getAgentIcon(agent.name);
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected 
          ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' 
          : 'hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-md', getAgentColor(agent.name))}>
            <IconComponent className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">
                {getDisplayName(agent)}
              </h3>
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            
            {agent.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {agent.description}
              </p>
            )}
            
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.capabilities.slice(0, 3).map((capability) => (
                  <Badge 
                    key={capability.type} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {capability.type}
                  </Badge>
                ))}
                {agent.capabilities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.capabilities.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}