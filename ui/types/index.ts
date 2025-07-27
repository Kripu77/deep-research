// Core domain types
export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly instructions?: string;
  readonly provider?: string;
  readonly modelId?: string;
  readonly tools?: Record<string, unknown>;
  readonly workflows?: Record<string, unknown>;
  readonly defaultGenerateOptions?: Record<string, unknown>;
  readonly defaultStreamOptions?: Record<string, unknown>;
  readonly isActive?: boolean;
  readonly capabilities?: AgentCapability[];
}

export interface AgentCapability {
  readonly type: 'search' | 'analysis' | 'synthesis' | 'evaluation' | 'reporting';
  readonly description: string;
}

export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
  readonly agentName?: string;
  readonly metadata?: MessageMetadata;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageMetadata {
  readonly tokens?: number;
  readonly processingTime?: number;
  readonly sources?: string[];
}

export interface ChatSession {
  readonly id: string;
  readonly agentName: string;
  readonly messages: readonly Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly status: SessionStatus;
}

export type SessionStatus = 'active' | 'completed' | 'error' | 'archived';

// API types
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly metadata?: ResponseMetadata;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  readonly requestId: string;
  readonly timestamp: Date;
  readonly processingTime: number;
}

export interface AgentResponse {
  readonly text?: string;
  readonly object?: unknown;
  readonly toolCalls?: readonly ToolCall[];
}

export interface ToolCall {
  readonly id: string;
  readonly toolName: string;
  readonly args: Record<string, unknown>;
  readonly result?: unknown;
  readonly status: ToolCallStatus;
}

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed';

// UI State types
export interface UIState {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectedAgent: Agent | null;
}

export interface ChatState extends UIState {
  readonly messages: readonly Message[];
  readonly currentSession: ChatSession | null;
  readonly conversationId: string;
}

export interface AgentState extends UIState {
  readonly agents: readonly Agent[];
  readonly selectedAgent: Agent | null;
}

// Event types
export interface AppEvent {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
}

export interface MessageEvent extends AppEvent {
  readonly type: 'message_sent' | 'message_received' | 'message_error';
  readonly payload: {
    readonly messageId: string;
    readonly agentName?: string;
  };
}

export interface AgentEvent extends AppEvent {
  readonly type: 'agent_selected' | 'agent_loaded' | 'agent_error';
  readonly payload: {
    readonly agentName: string;
  };
}