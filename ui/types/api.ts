import type { Agent, AgentResponse } from './index';

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

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly metadata?: ResponseMetadata;
}

// API Client configuration
export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retries: number;
  readonly headers?: Record<string, string>;
}

// Request/Response types
export interface ChatRequest {
  readonly messages: readonly {
    readonly role: 'user' | 'assistant';
    readonly content: string;
  }[];
  readonly conversationId?: string;
  readonly options?: ChatOptions;
}

export interface ChatOptions {
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly stream?: boolean;
}

export interface StreamChunk {
  readonly id: string;
  readonly content: string;
  readonly isComplete: boolean;
  readonly metadata?: Record<string, unknown>;
}

// API method signatures
export interface ApiMethods {
  getAgents(): Promise<ApiResponse<Record<string, Agent>>>;
  getAgent(name: string): Promise<ApiResponse<Agent>>;
  chatWithAgent(
    agentName: string,
    message: string,
    conversationId?: string
  ): Promise<ApiResponse<AgentResponse>>;
  streamChatWithAgent(
    agentName: string,
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onComplete?: (response: string) => void,
    onError?: (error: string) => void
  ): Promise<() => void>;
  runWorkflow(
    workflowName: string,
    input: unknown
  ): Promise<ApiResponse<unknown>>;
  getWorkflows(): Promise<ApiResponse<readonly string[]>>;
}

// Error types
export interface NetworkError extends Error {
  readonly code: 'NETWORK_ERROR';
  readonly status?: number;
}

export interface ValidationError extends Error {
  readonly code: 'VALIDATION_ERROR';
  readonly field: string;
}

export interface ApiClientError extends Error {
  readonly code: 'API_CLIENT_ERROR';
  readonly originalError: Error;
}