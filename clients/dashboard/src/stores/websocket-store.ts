import { create } from 'zustand';

export interface ExecutionResult {
  type: string;
  timestamp: string;
  executionId?: string;
  payload: {
    result?: any;
    status?: string;
    error?: string;
    userId?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

interface WebSocketState {
  // Array of execution results
  execution_results: ExecutionResult[];
  
  // Actions
  addExecutionResult: (result: ExecutionResult) => void;
  clearExecutionResults: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  // Initial state
  execution_results: [],

  // Actions
  addExecutionResult: (result) => 
    set((state) => ({
      execution_results: [...state.execution_results, result]
    })),

  clearExecutionResults: () => 
    set({ execution_results: [] }),
}));