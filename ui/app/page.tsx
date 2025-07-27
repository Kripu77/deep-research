'use client';

import { Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import { AgentSelector } from '@/components/agents/agent-selector';
import { ChatInterface } from '@/components/chat/chat-interface';
import { EmptyState } from '@/components/common/empty-state';
import { useSelectedAgent, useAgentList } from '@/stores/agent-store';
import type { Agent } from '@/types';

export default function HomePage() {
  const selectedAgent = useSelectedAgent();
  const { agents } = useAgentList();

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Agent Selector */}
        <div className="lg:col-span-1">
          <AgentSelector />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          {selectedAgent ? (
            <ChatInterface
              agentName={selectedAgent.name}
              agentDisplayName={selectedAgent.displayName}
              agentDescription={selectedAgent.description}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center space-y-4">
                <EmptyState
                  icon={
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl w-fit mx-auto">
                        <Brain className="h-16 w-16 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  }
                  title="Welcome to Deep Research Assistant"
                  description="Select an AI agent from the sidebar to begin your research journey. Each agent specializes in different aspects of research and analysis."
                />
                
                {agents.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm mt-6">
                    {agents.slice(0, 4).map((agent: Agent, index: number) => {
                      const colors = [
                        'bg-blue-50 text-blue-700 border-blue-200',
                        'bg-green-50 text-green-700 border-green-200',
                        'bg-purple-50 text-purple-700 border-purple-200',
                        'bg-orange-50 text-orange-700 border-orange-200',
                      ];
                      
                      return (
                        <div key={agent.id} className={`p-3 rounded-lg border ${colors[index]}`}>
                          <h4 className="font-medium text-sm">
                            {agent.displayName || agent.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()).trim()}
                          </h4>
                          <p className="text-xs mt-1">
                            {agent.description || `${agent.name} for specialized tasks`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-4">
                  ✨ Experience AI-powered research with real-time responses
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
