'use client';

import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  readonly data: T | null;
  readonly error: Error | null;
  readonly isLoading: boolean;
}

type AsyncFunction<T> = () => Promise<T>;

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  dependencies: readonly unknown[] = []
): AsyncState<T> & { readonly execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        isLoading: false 
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, execute };
}

export function useAsyncCallback<T, Args extends readonly unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
): AsyncState<T> & { readonly execute: (...args: Args) => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (...args: Args) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction(...args);
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        isLoading: false 
      });
    }
  }, [asyncFunction]);

  return { ...state, execute };
}