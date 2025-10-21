import { Tool } from '@mastra/core';
import { createQueryExecutor, queryExecutionInputSchema, QueryExecutionResult } from './factory';
import { DataSource } from '../../types';
import { 
  VisualizationBuilder, 
  queryResultsToVisualizationData, 
  suggestVisualizationType,
  sendDataVisualization 
} from '@zeiro/sdk';

/**
 * Factory function to create a query execution tool with prefetched data source
 * @param dataSource - The prefetched data source for execution
 * @param options - Optional WebSocket configuration for data visualization
 * @returns Configured query execution tool
 */
export function getQueryExecutionTool(
  dataSource: DataSource, 
  options?: {
    websocketManager?: any;
    executionId?: string;
    threadId?: string;
  }
) {
  return new Tool({
    id: 'query_execution',
    description: `Executes database queries safely against the data source. This tool is pre-configured for data source: ${dataSource.name} (${dataSource.type}). Only SELECT queries are allowed for security. 

IMPORTANT: When users request specific chart types (pie chart, bar chart, etc.), you MUST pass their original request in the userIntent parameter to ensure the correct visualization type is created.

Example: If user says "show in pie chart", call this tool with userIntent: "show in pie chart"`,
    inputSchema: queryExecutionInputSchema,
    
    execute: async ({ context }) => {
      const { query, limit, timeout, userIntent } = context;
      
      try {
        console.log('⚡ Executing query on:', dataSource.name, `(${dataSource.type})`);
        console.log('📝 Query:', query);
        console.log('🎯 User Intent:', userIntent || 'Not provided');
        
        // Create query executor for the data source type
        const queryExecutor = createQueryExecutor(dataSource);
        
        // Execute the query with options
        const result = await queryExecutor.executeQuery(query, { limit, timeout });
        
        // Log execution results
        if (result.success) {
          console.log(`✅ Query executed successfully in ${result.executionTime}ms`);
          console.log(`📊 Returned ${result.rowCount} rows`);
          
          // Send data visualization if WebSocket is available and we have data
          if (options?.websocketManager && options?.executionId && options?.threadId && result.data && result.data.length > 0) {
            try {
              console.log('📈 Creating data visualization...');
              
              // Convert query results to visualization data
              const visualizationData = queryResultsToVisualizationData(result.data);
              
              // Suggest the best visualization type based on data and user intent
              const suggestedType = suggestVisualizationType(visualizationData, userIntent);
              console.log(`💡 Suggested visualization type: ${suggestedType}${userIntent ? ` (based on user intent: "${userIntent}")` : ''}`);
              
              // Build visualization
              const visualization = new VisualizationBuilder(suggestedType, visualizationData)
                .withQuery(query)
                .build();
              
              // Send to frontend
              await sendDataVisualization(
                options.websocketManager,
                visualization,
                options.executionId,
                options.threadId
              );
              
              console.log('📊 Data visualization sent to frontend');
              
              // Return a very minimal result when visualization is sent
              return {
                success: true,
                query,
                executionTime: result.executionTime,
                rowCount: result.rowCount,
                data: [], // Empty array so agent doesn't see the data
                visualizationSent: true, // Flag to indicate visualization was sent
                message: `Query executed successfully. Found ${result.rowCount} ${result.rowCount === 1 ? 'record' : 'records'}.`
              };
            } catch (vizError) {
              console.error('⚠️ Failed to send data visualization:', vizError);
              // Don't fail the tool execution if visualization fails
            }
          }
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
