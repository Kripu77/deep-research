// Store-specific types
export interface StoreState {
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface StoreActions {
  readonly clearError: () => void;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
}

export interface AsyncAction<T = void> {
  (...args: any[]): Promise<T>;
}

export interface StoreSlice<T> {
  readonly state: T;
  readonly actions: Record<string, (...args: any[]) => any>;
}

// Store configuration
export interface StoreConfig {
  readonly name: string;
  readonly version?: number;
  readonly persist?: boolean;
  readonly devtools?: boolean;
}