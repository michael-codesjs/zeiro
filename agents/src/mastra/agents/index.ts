import { Memory } from '@mastra/memory';
import { Agent } from "@mastra/core"
import { DynamoDBStore } from '@mastra/dynamodb';
import { getInstructions } from './utils/get-instructions';
import { openai } from '@ai-sdk/openai';
import {
  getDataSourceIntrospectionTool,
  getQueryGenerationTool,
  getQueryExecutionTool
} from '../tools';
import { DataSource } from '../types';
import { StreamingToolWrapper } from '../tools/streaming-tool-wrapper';

type Config = {
  user_id: string
  dataSource: DataSource
  websocketManager?: any // WebSocketManager from SDK - optional for backwards compatibility
}

export class Zeiro {
  
  private memory: Memory
  private dataSource: DataSource
  private user_id: string
  private agent: Agent = {} as any
  private websocketManager?: any
  private streamingWrapper?: StreamingToolWrapper
  private currentExecutionId?: string
  private currentThreadId?: string

  constructor(config: Config) {

    this.dataSource = config.dataSource
    this.user_id = config.user_id
    this.websocketManager = config.websocketManager

    // Validate that user_id is provided for user identification
    if (!config.user_id) {
      throw new Error('user_id is required for user identification');
    }

    // Validate that data source is provided
    if (!config.dataSource) {
      throw new Error('dataSource is required');
    }

     // Initialize DynamoDB storage for Mastra
     const storage = new DynamoDBStore({
      name: "dynamodb-storage",
      config: {
        tableName: process.env.MASTRA_STORAGE_TABLE_NAME!,
        region: 'eu-central-1'
      },
    });

    // Initialize Memory with DynamoDB storage and enhanced thread options
    this.memory = new Memory({
      storage: storage as any,
      options: {
        lastMessages: 20,
        threads: {
          generateTitle: true
        },
        workingMemory: {
          enabled: true,
          scope: 'thread', // TODO: change to resource when supported
        },
      },
    });

    this.setupAgent()

  }

  private async setupAgent() {
    // Get base tools - visualization options will be set dynamically during execution
    const introspectionTool = getDataSourceIntrospectionTool(this.dataSource);
    const queryGenerationTool = getQueryGenerationTool(this.dataSource);
    const queryExecutionTool = getQueryExecutionTool(this.dataSource);

    // Wrap tools with streaming if WebSocket manager is available
    let tools: Record<string, any>;
    if (this.websocketManager) {
      // Note: StreamingWrapper will be initialized in streamLegacy with executionId
      tools = {
        'Introspect Data Source': introspectionTool,
        'Generate Query': queryGenerationTool,
        'Execute Query': queryExecutionTool
      };
    } else {
      tools = {
        'Introspect Data Source': introspectionTool,
        'Generate Query': queryGenerationTool,
        'Execute Query': queryExecutionTool
      };
    }

    this.agent = new Agent({
      name: 'Zeiro Data Analyst',
      instructions: getInstructions({
        data_source_name: this.dataSource.name,
        data_source_type: this.dataSource.type,
        data_source_id: this.dataSource.id,
        user_id: this.user_id
      }),
      model: openai('gpt-4o-mini'),
      tools,
      memory: this.memory
    });
  }

  public getAgent(): Agent {
    return this.agent;
  }

  /**
   * Update tools with current execution context for visualization support
   */
  private updateToolsWithExecutionContext(executionId: string, threadId: string) {
    if (!this.websocketManager) return;

    // Create tools with WebSocket options for visualization
    const websocketOptions = {
      websocketManager: this.websocketManager,
      executionId,
      threadId
    };

    const introspectionTool = getDataSourceIntrospectionTool(this.dataSource);
    const queryGenerationTool = getQueryGenerationTool(this.dataSource);
    const queryExecutionTool = getQueryExecutionTool(this.dataSource, websocketOptions);

    // Initialize streaming wrapper with current context
    this.streamingWrapper = new StreamingToolWrapper(this.websocketManager, executionId, threadId);

    // Wrap tools for streaming
    const tools = {
      'Introspect Data Source': this.streamingWrapper.wrapTool(introspectionTool),
      'Generate Query': this.streamingWrapper.wrapTool(queryGenerationTool),
      'Execute Query': this.streamingWrapper.wrapTool(queryExecutionTool)
    };

    // Recreate agent with updated tools
    this.agent = new Agent({
      name: 'Zeiro Data Analyst',
      instructions: getInstructions({
        data_source_name: this.dataSource.name,
        data_source_type: this.dataSource.type,
        data_source_id: this.dataSource.id,
        user_id: this.user_id
      }),
      model: openai('gpt-4o'),
      tools,
      memory: this.memory
    });
  }

  // Thread management methods
  private async createThread(): Promise<string> {
    const thread = await this.memory.createThread({
      resourceId: this.dataSource.id,
      title: `Chat with ${this.dataSource.name}`,
      metadata: {
        userId: this.user_id,
        dataSourceId: this.dataSource.id,
        dataSourceName: this.dataSource.name,
        createdAt: new Date().toISOString()
      }
    })
    return thread.id
  }

  public async streamLegacy(messages: any[], options: { threadId?: string; executionId?: string } = {}) {
    // Handle thread ID - use provided one or create new
    const threadId = options.threadId || await this.createThread()
    
    // If WebSocket manager is available and executionId is provided, update tools with execution context
    if (this.websocketManager && options.executionId) {
      // Store current execution context
      this.currentExecutionId = options.executionId;
      this.currentThreadId = threadId;
      
      // Create tools with WebSocket options for visualization
      const websocketOptions = {
        websocketManager: this.websocketManager,
        executionId: options.executionId,
        threadId
      };

      const introspectionTool = getDataSourceIntrospectionTool(this.dataSource);
      const queryGenerationTool = getQueryGenerationTool(this.dataSource);
      const queryExecutionTool = getQueryExecutionTool(this.dataSource, websocketOptions);

      // Initialize streaming wrapper with current context
      this.streamingWrapper = new StreamingToolWrapper(this.websocketManager, options.executionId, threadId);
      
      // Re-setup agent with streaming tools and visualization support
      this.agent = new Agent({
        name: 'Zeiro Data Analyst',
        instructions: getInstructions({
          data_source_name: this.dataSource.name,
          data_source_type: this.dataSource.type,
          data_source_id: this.dataSource.id,
          user_id: this.user_id
        }),
        model: openai('gpt-4o'),
        tools: {
          'Introspect Data Source': this.streamingWrapper.wrapTool(introspectionTool),
          'Generate Query': this.streamingWrapper.wrapTool(queryGenerationTool),
          'Execute Query': this.streamingWrapper.wrapTool(queryExecutionTool)
        },
        memory: this.memory
      });
    }
    
    // Create stream options with proper resourceId and threadId
    const streamOptions = {
      resourceId: this.dataSource.id,
      threadId: threadId
    }

    // Stream using the agent with proper options
    const stream = await this.agent.streamLegacy(messages, streamOptions)
    
    // Return both the stream and the threadId for reference
    return {
      stream,
      threadId
    }
  }

}