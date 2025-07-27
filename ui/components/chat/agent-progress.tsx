'use client';

import { Brain, Search, BarChart3, Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAgentProgress } from '@/stores/chat-store';

const phaseIcons = {
  'Initializing': Loader2,
  'Planning': Brain,
  'Searching': Search,
  'Analyzing': BarChart3,
  'Synthesizing': Lightbulb,
} as const;

const phaseColors = {
  'Initializing': 'bg-gray-100 text-gray-700 border-gray-200',
  'Planning': 'bg-blue-100 text-blue-700 border-blue-200',
  'Searching': 'bg-green-100 text-green-700 border-green-200',
  'Analyzing': 'bg-orange-100 text-orange-700 border-orange-200',
  'Synthesizing': 'bg-purple-100 text-purple-700 border-purple-200',
} as const;

interface AgentProgressProps {
  className?: string;
}

export function AgentProgress({ className }: AgentProgressProps): JSX.Element | null {
  const { agentProgress, isStreaming } = useAgentProgress();

  if (!isStreaming || !agentProgress) {
    return null;
  }

  const Icon = phaseIcons[agentProgress.phase as keyof typeof phaseIcons] || Brain;
  const colorClass = phaseColors[agentProgress.phase as keyof typeof phaseColors] || phaseColors.Planning;

  return (
    <Card className={cn('border-l-4 border-l-blue-500 bg-blue-50/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Icon 
              className={cn(
                'h-5 w-5',
                agentProgress.phase === 'Initializing' ? 'animate-spin' : ''
              )} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={cn('text-xs font-medium', colorClass)}
              >
                {agentProgress.phase}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {agentProgress.action}
              </p>
              <p className="text-xs text-gray-600 italic">
                💭 {agentProgress.thinking}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}