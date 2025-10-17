import { Tool } from '@mastra/core';
import { WebSocketManager } from '@zeiro/sdk/src/lib/websocket/manager';

/**
 * Wraps a Mastra tool to emit WebSocket events for tool calls
 */
export class StreamingToolWrapper {
  private websocket: WebSocketManager;
  private executionId: string;
  private threadId?: string;

  constructor(websocket: WebSocketManager, executionId: string, threadId?: string) {
    this.websocket = websocket;
    this.executionId = executionId;
    this.threadId = threadId;
  }

  /**
   * Wraps a tool to emit streaming events
   */
  wrapTool(tool: any): any {
    const originalExecute = tool.execute.bind(tool);

    return new Tool({
      id: tool.id,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (params: any) => {
        // Send tool call started event
        await this.websocket.publishChatUpdate('tool_call_started', {
          tool_id: tool.id,
          tool_name: this.getToolDisplayName(tool.id),
          description: tool.description,
          input: params.context,
          timestamp: new Date().toISOString()
        }, {
          threadId: this.threadId,
          executionId: this.executionId,
          failSilently: true
        });

        try {
          // Execute the original tool
          const result = await originalExecute(params);

          // Send tool call completed event
          await this.websocket.publishChatUpdate('tool_call_completed', {
            tool_id: tool.id,
            tool_name: this.getToolDisplayName(tool.id),
            input: params.context,
            result: this.formatToolResult(tool.id, result),
            timestamp: new Date().toISOString()
          }, {
            threadId: this.threadId,
            executionId: this.executionId,
            failSilently: true
          });

          return result;
        } catch (error) {
          // Send tool call failed event
          await this.websocket.publishChatUpdate('tool_call_failed', {
            tool_id: tool.id,
            tool_name: this.getToolDisplayName(tool.id),
            input: params.context,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }, {
            threadId: this.threadId,
            executionId: this.executionId,
            failSilently: true
          });

          throw error;
        }
      }
    });
  }

  /**
   * Get user-friendly display name for tools
   */
  private getToolDisplayName(toolId: string): string {
    const displayNames: Record<string, string> = {
      'query_generation': 'Generate Query',
      'query_execution': 'Execute Query',
      'data_source_introspection': 'Explore Data Source'
    };
    return displayNames[toolId] || toolId;
  }

  /**
   * Format tool results for frontend display
   */
  private formatToolResult(toolId: string, result: any): any {
    switch (toolId) {
      case 'query_generation':
        return {
          type: 'query',
          query: result.query,
          explanation: result.explanation,
          tables_used: result.tables_used
        };
      
      case 'query_execution':
        return {
          type: 'query_result',
          success: result.success,
          data: result.data?.slice(0, 5), // Show first 5 rows only
          rowCount: result.rowCount,
          executionTime: result.executionTime,
          query: result.query,
          error: result.error
        };
      
      case 'data_source_introspection':
        return {
          type: 'schema_info',
          tables: result.tables?.slice(0, 10), // Show first 10 tables
          totalTables: result.tables?.length,
          summary: result.summary
        };
      
      default:
        return result;
    }
  }
}
