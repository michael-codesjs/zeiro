import { z } from 'zod';

export interface QueryExecutionResult {
  success: boolean;
  data?: any[];
  rowCount?: number;
  executionTime?: number;
  error?: string;
  query: string;
  message?: string; // For custom messages when visualizations are sent
  visualizationSent?: boolean; // Flag to indicate if visualization was sent
  metadata?: {
    columns?: Array<{
      name: string;
      type: string;
    }>;
    affectedRows?: number;
    warnings?: string[];
  };
}

// New execution record types
export interface QueryExecutionRecord {
  executionId: string;
  userId: string;
  dataSourceId: string;
  query: string;
  status: 'pending' | 'queued' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  results?: any[];
  error?: string;
  executionTime?: number;
  metadata?: {
    rowCount?: number;
    columns?: Array<{ name: string; type: string }>;
  };
}

// Event for async processing
export interface QueryExecutionEvent {
  executionId: string;
  userId: string;
  dataSourceId: string;
  query: string;
  options?: {
    limit?: number;
    timeout?: number;
  };
}

// Zod schema for query execution input
export const queryExecutionInputSchema = z.object({
  query: z.string().describe('The SQL query to execute'),
  limit: z.number().min(1).max(1000).default(100).optional().describe('Maximum number of rows to return (default: 100, max: 1000)'),
  timeout: z.number().min(1).max(30).default(10).optional().describe('Query timeout in seconds (default: 10, max: 30)'),
  async: z.boolean().default(false).optional().describe('Whether to execute asynchronously (default: false)'),
  userIntent: z.string().optional().describe('The original user request to help determine the best visualization type (e.g., "show in pie chart")'),
});

// Abstract base class for query executors
export abstract class QueryExecutor {
  abstract executeQuery(query: string, options?: { limit?: number; timeout?: number }): Promise<QueryExecutionResult>;
  abstract validateQuery(query: string): { isValid: boolean; error?: string; queryType?: string };
  abstract getSupportedOperations(): string[];
}