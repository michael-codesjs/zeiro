import { useMutation } from '@tanstack/react-query';
import { post } from 'aws-amplify/api';
import { toast } from 'react-hot-toast';
import { WEBSOCKET_CONFIG } from '../app/amplify.config';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface QueryInput {
  database_id: string;
  natural_language_query: string;
  max_results?: number;
  context?: string;
  thread_id?: string;
  auto_approve?: boolean; // New field for auto-approval
  model?: string; // Add model selection field
}

export interface ChartData {
  chartType: 'Table' | 'PieChart' | 'BarChart' | 'LineChart' | 'AreaChart' | 'ScatterPlot' | 'Message';
  title: string;
  data?: any[];
  message?: string;
  suggestions?: string[];
  metadata: {
    totalRecords?: number;
    queryType: string;
    executionTime?: string;
    dataSource: string;
  };
  chartConfig?: any;
}

export interface QueryResult {
  response: string;
  chartData?: ChartData;
  results?: any[];
  thread_id?: string;
  metadata: {
    operation?: string;
    count?: number;
    scannedCount?: number;
    projectedColumns?: string[] | null;
    performance?: {
      efficient: boolean;
      message: string;
    };
    reasoning?: string;
    confidence?: number;
    generatedQuery?: any;
  };
}

// Updated interface for the simplified flow
export interface QueryGenerationResult {
  response_type: 'query' | 'conversation';
  
  // For query responses
  query_id?: string;
  execution_id?: string; // Present when auto_approve=true
  operation?: string;
  parameters?: any;
  requiresApproval?: boolean;
  estimatedExecutionTime?: number;
  websocket_url?: string;
  auto_approved?: boolean;
  status?: 'pending' | 'queued' | 'executing';
  
  // For conversation responses
  conversation_response?: string;
  
  // Common fields
  explanation?: string;
  suggestedChartType?: string;
  title?: string;
  fieldValidation?: {
    valid: boolean;
    availableFields?: string[];
    message?: string;
  };
  thread_id?: string;
  suggestions?: string[];
}

// This interface is no longer needed since we don't have a separate async execution step
// Keeping for backward compatibility but it's now the same as QueryGenerationResult
export interface AsyncQueryResult extends QueryGenerationResult {}

export interface QueryResponse {
  success: boolean;
  data?: QueryResult | QueryGenerationResult | AsyncQueryResult;
  error?: string;
}

// Generate query and optionally queue for execution (unified flow)
const generateQuery = async (input: QueryInput): Promise<QueryResponse> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/chat/generate',
    options: {
      body: {
        database_id: input.database_id,
        natural_language_query: input.natural_language_query,
        thread_id: input.thread_id,
        model: input.model // Add model parameter
      }
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as QueryResponse;
};

// Execute a generated query by query_id
const executeGeneratedQuery = async (queryId: string): Promise<QueryResponse> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/query/execute',
    options: {
      body: {
        query_id: queryId
      }
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as QueryResponse;
};

// Execute a query by execution_id
const executeQuery = async (executionId: string): Promise<QueryResponse> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/executions/execute',
    options: {
      body: {
        execution_id: executionId
      }
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as QueryResponse;
};

// Legacy synchronous execution (still available for manual queries)
const executeManualQuery = async (input: QueryInput): Promise<QueryResponse> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/query/execute',
    options: {
      body: {
        database_id: input.database_id,
        natural_language_query: input.natural_language_query,
        max_results: input.max_results || 10,
        context: input.context,
        thread_id: input.thread_id
      }
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as QueryResponse;
};

// Main hook for generating queries (now handles queuing automatically if auto_approve=true)
export const useGenerateQuery = () => {
  return useMutation({
    mutationFn: generateQuery,
    onError: (error) => {
      console.error('Query generation failed:', error);
      toast.error('Failed to generate query');
    }
  });
};

// Hook for executing a generated query
export const useExecuteGeneratedQuery = () => {
  return useMutation({
    mutationFn: executeGeneratedQuery,
    onError: (error) => {
      console.error('Query execution failed:', error);
      toast.error('Failed to execute query');
    }
  });
};

// Hook for executing queries by execution_id (queues for async processing)
export const useExecuteQuery = () => {
  return useMutation({
    mutationFn: executeQuery,
    onError: (error) => {
      console.error('Query execution failed:', error);
      toast.error('Query execution failed');
    }
  });
};

// Legacy hook for synchronous execution (for manual queries)
export const useNaturalLanguageQuery = () => {
  return useMutation({
    mutationFn: executeManualQuery,
    onError: (error) => {
      console.error('Query failed:', error);
      toast.error('Query failed');
    }
  });
};

// REMOVED: useExecuteQueryAsync is no longer needed since generate-query handles queuing
// The frontend should:
// 1. Call useGenerateQuery with auto_approve: true
// 2. Listen for results via WebSocket using the provided execution_id 