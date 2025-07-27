import type { Agent } from '@/types';
import { mastraApi } from '@/lib/api';
import { createBaseStore, createAsyncAction, type BaseStore } from './base-store';

// Agent store state
interface AgentStoreState {
  readonly agents: readonly Agent[];
  readonly selectedAgent: Agent | null;
}

// Agent store actions
interface AgentStoreActions {
  readonly loadAgents: () => Promise<void>;
  readonly selectAgent: (agent: Agent | null) => void;
  readonly refreshAgents: () => Promise<void>;
  readonly getAgentByName: (name: string) => Agent | undefined;
}

// Combined agent store interface
export interface AgentStore extends BaseStore, AgentStoreState, AgentStoreActions {}

// Create the agent store
export const useAgentStore = createBaseStore<AgentStore>(
  { name: 'agent-store', devtools: true },
  (set, get) => ({
    // State
    agents: [],
    selectedAgent: null,

    // Actions
    loadAgents: createAsyncAction(
      { getState: get, setState: set },
      async () => {
        try {
          const response = await mastraApi.getAgents();
          
          if (response.success && response.data) {
            const agentsArray = Object.entries(response.data).map(([key, agent]) => ({
              ...agent,
              id: key,
              name: key, // Use the camelCase key for API calls
              displayName: agent.name, // Preserve the original display name
            }));
            
            set({ agents: agentsArray });
          } else {
            console.error('API Error:', response.error);
            throw new Error(response.error?.message || 'Failed to load agents');
          }
        } catch (error) {
          console.error('Network Error:', error);
          throw error;
        }
      }
    ),

    selectAgent: (agent: Agent | null) => {
      set({ selectedAgent: agent });
    },

    refreshAgents: async () => {
      await get().loadAgents();
    },

    getAgentByName: (name: string) => {
      return get().agents.find(agent => agent.name === name);
    },
  })
);

// Selectors for derived state
export const agentSelectors = {
  getSelectedAgentName: (state: AgentStore) => state.selectedAgent?.name,
  getAgentCount: (state: AgentStore) => state.agents.length,
  getActiveAgents: (state: AgentStore) => state.agents.filter(agent => agent.isActive),
  getAgentsByCapability: (state: AgentStore, capability: string) =>
    state.agents.filter(agent => 
      agent.capabilities?.some(cap => cap.type === capability)
    ),
};

// Custom hooks for specific use cases
export const useSelectedAgent = () => {
  return useAgentStore(state => state.selectedAgent);
};

export const useAgentList = () => {
  const agents = useAgentStore(state => state.agents);
  const isLoading = useAgentStore(state => state.isLoading);
  const error = useAgentStore(state => state.error);
  const loadAgents = useAgentStore(state => state.loadAgents);
  
  return { agents, isLoading, error, loadAgents };
};

export const useAgentSelection = () => {
  const selectedAgent = useAgentStore(state => state.selectedAgent);
  const selectAgent = useAgentStore(state => state.selectAgent);
  const getAgentByName = useAgentStore(state => state.getAgentByName);
  
  return { selectedAgent, selectAgent, getAgentByName };
};