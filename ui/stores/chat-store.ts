import type { Message, ChatSession } from '@/types';
import { mastraApi } from '@/lib/api';
import { createBaseStore, createAsyncAction, type BaseStore } from './base-store';

// Chat store state
interface ChatStoreState {
  readonly messages: readonly Message[];
  readonly currentSession: ChatSession | null;
  readonly conversationId: string;
  readonly isStreaming: boolean;
  readonly streamingMessageId: string | null;
  readonly agentProgress: {
    readonly phase: string;
    readonly action: string;
    readonly thinking: string;
  } | null;
}

// Chat store actions
interface ChatStoreActions {
  readonly sendMessage: (content: string, agentName: string) => Promise<void>;
  readonly clearMessages: () => void;
  readonly startNewSession: (agentName: string) => void;
  readonly addMessage: (message: Message) => void;
  readonly updateMessage: (messageId: string, updates: Partial<Message>) => void;
  readonly generateConversationId: () => void;
}

// Combined chat store interface
export interface ChatStore extends BaseStore, ChatStoreState, ChatStoreActions {}

// Utility functions
const generateId = (): string => 
  `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createMessage = (
  role: Message['role'],
  content: string,
  agentName?: string
): Message => {
  const message: Message = {
    id: `msg_${Date.now()}_${role}`,
    role,
    content,
    timestamp: new Date(),
  };
  
  if (agentName) {
    return { ...message, agentName };
  }
  
  return message;
};

// Create the chat store
export const useChatStore = createBaseStore<ChatStore>(
  { name: 'chat-store', devtools: true },
  (set, get) => ({
    // State
    messages: [],
    currentSession: null,
    conversationId: generateId(),
    isStreaming: false,
    streamingMessageId: null,
    agentProgress: null,

    // Actions
    sendMessage: async (content: string, agentName: string) => {
      const asyncAction = createAsyncAction(
        { getState: get, setState: set },
        async () => {
        if (!agentName || !content.trim()) {
          throw new Error('Agent name and message content are required');
        }

        const userMessage = createMessage('user', content.trim(), undefined);
        
        // Add user message immediately
        set(state => ({
          messages: [...state.messages, userMessage],
          isStreaming: true,
          agentProgress: {
            phase: 'Initializing',
            action: 'Starting research...',
            thinking: 'Preparing to analyze your request'
          }
        }));

        // Create placeholder assistant message for streaming
        const assistantMessageId = `msg_${Date.now()}_assistant`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          agentName,
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
          streamingMessageId: assistantMessageId,
        }));

        try {
          let streamingContent = '';
          
          const cleanup = await mastraApi.streamChatWithAgent(
            agentName,
            content.trim(),
            get().conversationId,
            // onChunk callback
            (chunk: string) => {
              streamingContent += chunk;
              
              // Parse chunk for progress information
              try {
                // Look for progress markers in the chunk
                if (chunk.includes('**Planning Phase**') || chunk.includes('Planning Phase')) {
                  set(state => ({
                    agentProgress: {
                      phase: 'Planning',
                      action: 'Analyzing request and planning research strategy',
                      thinking: 'Breaking down the topic and determining search approach'
                    }
                  }));
                } else if (chunk.includes('**Search Phase**') || chunk.includes('Search Phase')) {
                  set(state => ({
                    agentProgress: {
                      phase: 'Searching',
                      action: 'Executing web searches',
                      thinking: 'Finding relevant information sources'
                    }
                  }));
                } else if (chunk.includes('**Analysis Phase**') || chunk.includes('Analysis Phase')) {
                  set(state => ({
                    agentProgress: {
                      phase: 'Analyzing',
                      action: 'Evaluating search results',
                      thinking: 'Processing and analyzing found information'
                    }
                  }));
                } else if (chunk.includes('**Synthesis Phase**') || chunk.includes('Synthesis Phase')) {
                  set(state => ({
                    agentProgress: {
                      phase: 'Synthesizing',
                      action: 'Compiling comprehensive response',
                      thinking: 'Organizing findings into coherent insights'
                    }
                  }));
                }
              } catch (e) {
                // Ignore parsing errors for progress
              }

              // Update the streaming message content
              set(state => ({
                messages: state.messages.map(msg =>
                  msg.id === assistantMessageId 
                    ? { ...msg, content: streamingContent }
                    : msg
                ),
              }));
            },
            // onComplete callback
            (finalResponse: string) => {
              set(state => ({
                messages: state.messages.map(msg =>
                  msg.id === assistantMessageId 
                    ? { ...msg, content: finalResponse }
                    : msg
                ),
                isStreaming: false,
                streamingMessageId: null,
                agentProgress: null,
              }));
            },
            // onError callback
            (error: string) => {
              const errorMsg = createMessage(
                'assistant',
                `Sorry, I encountered an error: ${error}`,
                agentName
              );

              set(state => ({
                messages: [
                  ...state.messages.filter(msg => msg.id !== assistantMessageId),
                  errorMsg
                ],
                isStreaming: false,
                streamingMessageId: null,
                agentProgress: null,
              }));
            }
          );

          // Store cleanup function for potential cancellation
          // Note: We could add this to the store state if needed for cancellation
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          const errorMsg = createMessage(
            'assistant',
            `Sorry, I encountered an error: ${errorMessage}`,
            agentName
          );

          set(state => ({
            messages: [
              ...state.messages.filter(msg => msg.id !== assistantMessageId),
              errorMsg
            ],
            isStreaming: false,
            streamingMessageId: null,
            agentProgress: null,
          }));
          
          throw error;
        }
        });
      
      return asyncAction();
    },

    clearMessages: () => {
      set({
        messages: [],
        conversationId: generateId(),
        currentSession: null,
        isStreaming: false,
        streamingMessageId: null,
        agentProgress: null,
      });
    },

    startNewSession: (agentName: string) => {
      const newSession: ChatSession = {
        id: generateId(),
        agentName,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };

      set({
        currentSession: newSession,
        messages: [],
        conversationId: newSession.id,
        isStreaming: false,
        streamingMessageId: null,
        agentProgress: null,
      });
    },

    addMessage: (message: Message) => {
      set(state => ({
        messages: [...state.messages, message],
      }));
    },

    updateMessage: (messageId: string, updates: Partial<Message>) => {
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      }));
    },

    generateConversationId: () => {
      set({ conversationId: generateId() });
    },
  })
);

// Selectors for derived state
export const chatSelectors = {
  getMessageCount: (state: ChatStore) => state.messages.length,
  getLastMessage: (state: ChatStore) => 
    state.messages[state.messages.length - 1] || null,
  getMessagesByRole: (state: ChatStore, role: Message['role']) =>
    state.messages.filter(msg => msg.role === role),
  getUserMessages: (state: ChatStore) => 
    state.messages.filter(msg => msg.role === 'user'),
  getAssistantMessages: (state: ChatStore) => 
    state.messages.filter(msg => msg.role === 'assistant'),
  hasMessages: (state: ChatStore) => state.messages.length > 0,
  isSessionActive: (state: ChatStore) => 
    state.currentSession?.status === 'active',
};

// Custom hooks for specific use cases
export const useChatMessages = () => {
  const messages = useChatStore(state => state.messages);
  const isLoading = useChatStore(state => state.isLoading);
  const isStreaming = useChatStore(state => state.isStreaming);
  const error = useChatStore(state => state.error);
  
  return { messages, isLoading, isStreaming, error };
};

export const useChatActions = () => {
  const sendMessage = useChatStore(state => state.sendMessage);
  const clearMessages = useChatStore(state => state.clearMessages);
  const startNewSession = useChatStore(state => state.startNewSession);
  
  return { sendMessage, clearMessages, startNewSession };
};

export const useAgentProgress = () => {
  const agentProgress = useChatStore(state => state.agentProgress);
  const isStreaming = useChatStore(state => state.isStreaming);
  const streamingMessageId = useChatStore(state => state.streamingMessageId);
  
  return { agentProgress, isStreaming, streamingMessageId };
};

export const useChatSession = () => {
  const currentSession = useChatStore(state => state.currentSession);
  const conversationId = useChatStore(state => state.conversationId);
  const startNewSession = useChatStore(state => state.startNewSession);
  
  return { currentSession, conversationId, startNewSession };
};