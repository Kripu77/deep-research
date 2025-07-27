import type { 
  ApiMethods, 
  ApiClientConfig, 
  ApiResponse, 
  NetworkError, 
  ValidationError,
  ApiClientError 
} from '@/types/api';
import type { Agent, AgentResponse } from '@/types';
import { MastraClient } from '@mastra/client-js';

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'http://localhost:4112',
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Custom error classes
export class ApiNetworkError extends Error implements NetworkError {
  readonly code = 'NETWORK_ERROR' as const;
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiNetworkError';
    if (status !== undefined) {
      this.status = status;
    }
  }
}

export class ApiValidationError extends Error implements ValidationError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'ApiValidationError';
    this.field = field;
  }
}

export class ApiClientErrorImpl extends Error implements ApiClientError {
  readonly code = 'API_CLIENT_ERROR' as const;
  readonly originalError: Error;

  constructor(message: string, originalError: Error) {
    super(message);
    this.name = 'ApiClientError';
    this.originalError = originalError;
  }
}

// API Client implementation
export class MastraApiClient implements ApiMethods {
  private readonly config: ApiClientConfig;
  private mastraClient: MastraClient;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize the official Mastra client
    this.mastraClient = new MastraClient({
      baseUrl: this.config.baseUrl,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;



    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiNetworkError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
  

      return {
        success: true,
        data
      };
    } catch (error) {

      if (error instanceof ApiNetworkError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: { status: error.status },
          },
        };
      }

      const apiError = error instanceof Error 
        ? new ApiClientErrorImpl('Request failed', error)
        : new ApiClientErrorImpl('Unknown error', new Error('Unknown error'));

      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: { originalError: apiError.originalError.message },
        },
   
      };
    }
  }

  async getAgents(): Promise<ApiResponse<Record<string, Agent>>> {
    try {
      const agents = await this.mastraClient.getAgents();
      
      // Transform the response to match our Agent interface
      const transformedAgents: Record<string, Agent> = {};
      
      Object.entries(agents).forEach(([key, agent]) => {
        transformedAgents[key] = {
          id: key,
          name: key,
          displayName: (agent as any).name || key,
          description: (agent as any).description,
          instructions: (agent as any).instructions,
          isActive: true,
        };
      });
      
      return {
        success: true,
        data: transformedAgents
      };
    } catch (error) {
      const apiError = error instanceof Error 
        ? new ApiClientErrorImpl('Failed to get agents', error)
        : new ApiClientErrorImpl('Unknown error', new Error('Unknown error'));

      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: { originalError: apiError.originalError.message },
        },
      };
    }
  }

  async getAgent(name: string): Promise<ApiResponse<Agent>> {
    if (!name.trim()) {
      throw new ApiValidationError('Agent name is required', 'name');
    }
    return this.request<Agent>(`/agents/${encodeURIComponent(name)}`);
  }

  async chatWithAgent(
    agentName: string,
    message: string,
    conversationId?: string
  ): Promise<ApiResponse<AgentResponse>> {
    if (!agentName.trim()) {
      throw new ApiValidationError('Agent name is required', 'agentName');
    }
    if (!message.trim()) {
      throw new ApiValidationError('Message is required', 'message');
    }

    return this.request<AgentResponse>(`/agents/${encodeURIComponent(agentName)}/generate`, {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        ...(conversationId && { conversationId }),
      }),
    });
  }

  async streamChatWithAgent(
    agentName: string,
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onComplete?: (response: string) => void,
    onError?: (error: string) => void
  ): Promise<() => void> {
    if (!agentName.trim()) {
      throw new ApiValidationError('Agent name is required', 'agentName');
    }
    if (!message.trim()) {
      throw new ApiValidationError('Message is required', 'message');
    }

    let fullResponse = '';
    let isCompleted = false;

    const cleanup = () => {
      // Cleanup function for cancellation
    };

    try {
      // Get the agent instance from Mastra client
      const agent = this.mastraClient.getAgent(agentName);
      
      // Start streaming
      const response = await agent.stream({
        messages: [{ role: 'user', content: message }],
        ...(conversationId && { conversationId }),
      });

      // Process the stream using Mastra's processDataStream
      response.processDataStream({
        onTextPart: (text: string) => {
          if (!isCompleted) {
            fullResponse += text;
            onChunk?.(text);
          }
        },
        onDataPart: (data: any) => {
          // Handle structured data if needed
          console.log('Data part:', data);
        },
        onErrorPart: (error: any) => {
          if (!isCompleted) {
            isCompleted = true;
            onError?.(error.message || 'Stream error');
          }
        },
      });

      // Since we can't detect when streaming is complete from the API,
      // we'll use a timeout or other mechanism
      setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          onComplete?.(fullResponse);
        }
      }, 100);

      return cleanup;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
        onError?.(errorMessage);
      }
      return cleanup;
    }
  }

  async runWorkflow(
    workflowName: string,
    input: unknown
  ): Promise<ApiResponse<unknown>> {
    if (!workflowName.trim()) {
      throw new ApiValidationError('Workflow name is required', 'workflowName');
    }

    return this.request<unknown>(`/workflows/${encodeURIComponent(workflowName)}/run`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  async getWorkflows(): Promise<ApiResponse<readonly string[]>> {
    return this.request<readonly string[]>('/workflows');
  }
}

// Export singleton instance
export const mastraApi = new MastraApiClient();