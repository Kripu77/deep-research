import type { ReactNode, JSX } from 'react';
import type { Agent, Message } from './index';

// Base component props
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: ReactNode;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  readonly title?: string;
  readonly description?: string;
}

// Agent related component props
export interface AgentSelectorProps extends BaseComponentProps {
  readonly agents: readonly Agent[];
  readonly selectedAgent: Agent | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onAgentSelect?: (agent: Agent) => void;
  readonly onRefresh?: () => void;
}

export interface AgentCardProps extends BaseComponentProps {
  readonly agent: Agent;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

// Chat related component props
export interface ChatInterfaceProps extends BaseComponentProps {
  readonly agentName: string;
  readonly agentDisplayName?: string;
  readonly agentDescription?: string | undefined;
  readonly messages: readonly Message[];
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onSendMessage: (content: string) => Promise<void>;
  readonly onClearMessages: () => void;
}

export interface MessageProps extends BaseComponentProps {
  readonly message: Message;
  readonly agentName: string;
  readonly isStreaming?: boolean;
}

export interface MessageListProps extends BaseComponentProps {
  readonly messages: readonly Message[];
  readonly agentName: string;
  readonly isLoading?: boolean;
}

export interface ChatInputProps extends BaseComponentProps {
  readonly onSendMessage: (content: string) => Promise<void>;
  readonly isLoading?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

// UI component props
export interface LoadingSpinnerProps extends BaseComponentProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly text?: string | undefined;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface TooltipProps extends BaseComponentProps {
  readonly content: string;
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly align?: 'start' | 'center' | 'end';
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  readonly label?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
}

export interface InputProps extends FormFieldProps {
  readonly type?: 'text' | 'email' | 'password' | 'search';
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
}

export interface TextareaProps extends FormFieldProps {
  readonly placeholder?: string;
  readonly value?: string;
  readonly rows?: number;
  readonly onChange?: (value: string) => void;
}

export interface ButtonProps extends BaseComponentProps {
  readonly variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  readonly size?: 'default' | 'sm' | 'lg' | 'icon';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
}