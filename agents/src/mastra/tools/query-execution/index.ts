import { Tool } from '@mastra/core';
import { createQueryExecutor, queryExecutionInputSchema, QueryExecutionResult } from './factory';
import { DataSource } from '../../types';

/**
 * Factory function to create a query execution tool with prefetched data source
 * @param dataSource - The prefetched data source for execution
 * @returns Configured query execution tool
 */
export function getQueryExecutionTool(dataSource: DataSource) {
  return new Tool({
    id: 'query_execution',
    description: `Executes database queries safely against the data source. This tool is pre-configured for data source: ${dataSource.name} (${dataSource.type}). Only SELECT queries are allowed for security.`,
    inputSchema: queryExecutionInputSchema,
    
    execute: async ({ context }) => {
      const { query, limit, timeout } = context;
      
      try {
        console.log('⚡ Executing query on:', dataSource.name, `(${dataSource.type})`);
        console.log('📝 Query:', query);
        
        // Create query executor for the data source type
        const queryExecutor = createQueryExecutor(dataSource);
        
        // Execute the query with options
        const result = await queryExecutor.executeQuery(query, { limit, timeout });
        
        // Log execution results
        if (result.success) {
          console.log(`✅ Query executed successfully in ${result.executionTime}ms`);
          console.log(`📊 Returned ${result.rowCount} rows`);
        } else {
          console.log(`❌ Query execution failed: ${result.error}`);
        }
        
        return result;
      } catch (error) {
        const errorResult: QueryExecutionResult = {
          success: false,
          error: `Failed to execute ${dataSource.type} query: ${error instanceof Error ? error.message : String(error)}`,
          query,
          executionTime: 0,
        };
        
        console.error('💥 Query execution tool error:', errorResult.error);
        return errorResult;
      }
    }
  });
}

// Legacy export for backward compatibility (deprecated)
export const queryExecutionTool = new Tool({
  id: 'query_execution_legacy',
  description: 'Legacy query execution tool - use getQueryExecutionTool() factory function instead',
  inputSchema: queryExecutionInputSchema,
  execute: async () => {
    throw new Error('This legacy tool is deprecated. Use getQueryExecutionTool() factory function instead.');
  }
});

// Re-export for convenience
export * from './factory';
