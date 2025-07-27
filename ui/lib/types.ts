export interface Agent {
  name: string;
  description?: string;
  instructions?: string;
  provider?: string;
  modelId?: string;
  tools?: Record<string, unknown>;
  workflows?: Record<string, unknown>;
  defaultGenerateOptions?: Record<string, unknown>;
  defaultStreamOptions?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string | undefined;
}

export interface ChatSession {
  id: string;
  agentName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AgentResponse {
  text?: string;
  object?: unknown;
  toolCalls?: Array<{
    toolName: string;
    args: unknown;
  }>;
}