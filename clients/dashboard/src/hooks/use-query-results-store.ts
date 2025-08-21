import { create } from 'zustand';

export type ExecutionStatus = 'pending_approval' | 'queued' | 'executing' | 'completed' | 'failed';

export type ExecutionMetadata = {
  count?: number;
  scanned_count?: number;
  operation?: string;
  time_taken_ms?: number;
};

export type ExecutionResult = {
  executionId: string;
  status: ExecutionStatus;
  data?: any[]; // primary tabular data
  chartData?: any; // richer chart payloads if provided
  metadata?: ExecutionMetadata;
  error?: string;
};

type QueryResultsState = {
  // by execution id
  results: Record<string, ExecutionResult>;
  // the execution id currently active in the UI
  activeExecutionId: string | null;

  // actions
  setActiveExecution: (executionId: string | null) => void;
  upsertPending: (executionId: string, operation?: string) => void;
  upsertQueued: (executionId: string) => void;
  upsertExecuting: (executionId: string) => void;
  upsertCompleted: (executionId: string, payload: { data?: any[]; chartData?: any; metadata?: ExecutionMetadata }) => void;
  upsertFailed: (executionId: string, error?: string) => void;
  clear: () => void;
  remove: (executionId: string) => void;
};

export const useQueryResultsStore = create<QueryResultsState>((set, get) => ({
  results: {},
  activeExecutionId: null,

  setActiveExecution: (executionId) => set({ activeExecutionId: executionId }),

  upsertPending: (executionId, operation) =>
    set((state) => ({
      results: {
        ...state.results,
        [executionId]: {
          executionId,
          status: 'pending_approval',
          metadata: {
            ...(state.results[executionId]?.metadata || {}),
            operation,
          },
        },
      },
    })),

  upsertQueued: (executionId) =>
    set((state) => ({
      results: {
        ...state.results,
        [executionId]: {
          ...(state.results[executionId] || { executionId }),
          executionId,
          status: 'queued',
        },
      },
    })),

  upsertExecuting: (executionId) =>
    set((state) => ({
      results: {
        ...state.results,
        [executionId]: {
          ...(state.results[executionId] || { executionId }),
          executionId,
          status: 'executing',
        },
      },
    })),

  upsertCompleted: (executionId, payload) =>
    set((state) => ({
      results: {
        ...state.results,
        [executionId]: {
          ...(state.results[executionId] || { executionId }),
          executionId,
          status: 'completed',
          data: payload.data,
          chartData: payload.chartData,
          metadata: {
            ...(state.results[executionId]?.metadata || {}),
            ...payload.metadata,
          },
        },
      },
    })),

  upsertFailed: (executionId, error) =>
    set((state) => ({
      results: {
        ...state.results,
        [executionId]: {
          ...(state.results[executionId] || { executionId }),
          executionId,
          status: 'failed',
          error,
        },
      },
    })),

  clear: () => set({ results: {}, activeExecutionId: null }),
  remove: (executionId) =>
    set((state) => {
      const next = { ...state.results };
      delete next[executionId];
      return { results: next, activeExecutionId: state.activeExecutionId === executionId ? null : state.activeExecutionId };
    }),
}));

// Small helpers for mapping incoming WebSocket messages into store updates
export function mapWebSocketMessageToStoreUpdate(message: any, updaters: {
  upsertQueued: (executionId: string) => void;
  upsertExecuting: (executionId: string) => void;
  upsertCompleted: (executionId: string, payload: { data?: any[]; chartData?: any; metadata?: ExecutionMetadata }) => void;
  upsertFailed: (executionId: string, error?: string) => void;
}) {
  const executionId = message.executionId as string | undefined;
  if (!executionId) return;

  const status = message.payload?.status;
  if (status === 'queued') {
    updaters.upsertQueued(executionId);
    return;
  }
  if (status === 'executing') {
    updaters.upsertExecuting(executionId);
    return;
  }
  if (status === 'executed') {
    const chartData = message.payload?.result ?? undefined;
    const data = Array.isArray(chartData?.data) ? chartData.data : undefined;
    const metadata: ExecutionMetadata = {
      count: chartData?.metadata?.totalRecords ?? chartData?.count,
      scanned_count: chartData?.scanned_count,
      operation: chartData?.metadata?.queryType ?? chartData?.operation,
      time_taken_ms: chartData?.time_taken_ms,
    };
    updaters.upsertCompleted(executionId, { data, chartData, metadata });
    return;
  }
  if (status === 'failed') {
    updaters.upsertFailed(executionId, message.payload?.error);
  }
}


