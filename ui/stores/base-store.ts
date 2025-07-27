import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StoreState, StoreActions, StoreConfig } from './types';

// Base store interface that all stores should extend
export interface BaseStore extends StoreState, StoreActions {}

// Base store implementation
export const createBaseStore = <T extends BaseStore>(
  config: StoreConfig,
  storeCreator: (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
  ) => Omit<T, keyof BaseStore>
) => {
  return create<T>()(
    devtools(
      (set, get) => ({
        // Base state
        isLoading: false,
        error: null,

        // Base actions
        clearError: () => set({ error: null } as Partial<T>),
        setLoading: (loading: boolean) => set({ isLoading: loading } as Partial<T>),
        setError: (error: string | null) => set({ error } as Partial<T>),

        // Custom store implementation
        ...storeCreator(set, get),
      }) as T,
      {
        name: config.name,
        enabled: config.devtools ?? process.env.NODE_ENV === 'development',
      }
    )
  );
};

// Utility function for handling async actions
export const createAsyncAction = <T extends BaseStore, R = void>(
  store: {
    getState: () => T;
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  },
  action: () => Promise<R>
): (() => Promise<R>) => {
  return async () => {
    try {
      store.setState({ isLoading: true, error: null } as Partial<T>);
      const result = await action();
      store.setState({ isLoading: false } as Partial<T>);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      store.setState({ 
        isLoading: false, 
        error: errorMessage 
      } as Partial<T>);
      throw error;
    }
  };
};