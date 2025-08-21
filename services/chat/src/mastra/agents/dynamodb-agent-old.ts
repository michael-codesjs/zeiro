import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { DynamoDBStore } from "@mastra/dynamodb";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'

// Helper function to configure model based on the model string
function getModelConfig(model: string) {
  // Detect if it's a Claude/Anthropic model
  if (model.includes('claude') || model.includes('anthropic')) {
    return anthropic(model);
  }
  
  // Detect if it's a GPT/OpenAI model or default to OpenAI
  return openai(model);
}

// Simplified configuration for basic agent
export type AgentConfig = {
  database: {
    id: string
    name: string
  }
  model: string
  region?: string
}

export class SimpleAgent {

  private agent: Agent
  private memory: Memory | null = null
  private config: AgentConfig

  private current_thread_id: string | null = null
  private database_id: string | null = null

  constructor(config: AgentConfig) {
    this.config = config
    this.database_id = config.database?.id || null
    
    // Initialize DynamoDB storage for Mastra
    const storage = new DynamoDBStore({
      name: "dynamodb-storage",
      config: {
        tableName: process.env.MASTRA_STORAGE_TABLE_NAME,
        region: config.region || 'eu-central-1',
        credentials: fromNodeProviderChain()[0]
      },
    });

    // Initialize Memory with DynamoDB storage and enhanced thread options
    this.memory = new Memory({
      storage,
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
    
    // Validate that database_id is provided when memory is available
    if (this.memory && !this.database_id) {
      throw new Error('database_id is required when memory functionality is enabled. The database ID serves as the resource identifier for organizing conversation threads.');
    }

    this.agent = new Agent({
      name: 'Simple Chat Assistant',
      instructions: `You are a helpful chat assistant. Respond to user queries in a conversational manner.`,
      model: getModelConfig(this.config.model),
      tools: {},
      memory: this.memory,
    })
  }

  async createThread(title?: string, metadata?: Record<string, unknown>): Promise<string | null> {
    if (!this.memory) {
      console.warn('Memory not available. Initialize with mastraStorageTableName to use thread functionality.');
      return null;
    }
    
    // Create a thread with the database ID as the resourceId
    // Include title and metadata if provided
    const threadOptions: any = {
      resourceId: this.database_id
    };
    
    // Add title if provided
    if (title) {
      threadOptions.title = title;
    }
    
    // Add metadata if provided, including database context
    threadOptions.metadata = {
      database_id: this.database_id,
      table_name: this.config.database.name,
      createdAt: new Date().toISOString(),
      ...metadata
    };
    
    const thread = await this.memory.createThread(threadOptions);
    this.current_thread_id = thread.id;
    return thread.id;
  }

  async setThread(threadId: string): Promise<void> {
    this.current_thread_id = threadId;
  }

  // Enhanced method to update thread title
  async updateThreadTitle(threadId: string, title: string): Promise<void> {
    if (!this.memory) {
      throw new Error('Memory not available. Initialize with mastraStorageTableName to use thread functionality.');
    }
    
    // Note: This would require access to the underlying storage to update the thread
    // For now, we'll log this capability - the actual implementation would depend on 
    // Mastra's future support for thread updates
    console.log(`Thread title update requested: ${threadId} -> ${title}`);
    // TODO: Implement when Mastra supports thread updates
  }

  // Enhanced method to get thread with title information
  async getThreadWithMetadata(threadId: string) {
    if (!this.memory) {
      throw new Error('Memory not available. Initialize with mastraStorageTableName to use thread functionality.');
    }
    
    try {
      const thread = await this.memory.getThreadById({ threadId });
      return {
        ...thread,
        // Extract title and metadata for easier access
        title: thread.title || 'Untitled Conversation',
        metadata: thread.metadata || {},
        database_id: thread.metadata?.database_id || this.database_id,
        table_name: thread.metadata?.table_name
      };
    } catch (error) {
      console.error('Failed to get thread with metadata:', error)
      throw new Error(`Failed to get thread with metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Enhanced method to list threads with title and metadata
  async getUserThreadsWithMetadata(userId?: string) {
    if (!this.memory) {
      throw new Error('Memory not available. Initialize with mastraStorageTableName to use thread functionality.');
    }
    
    try {
      const user = userId || this.database_id || 'anonymous';
      const threads = await this.memory.getThreadsByResourceId({ resourceId: user });
      
      // Transform threads to include enhanced metadata
      return threads.map(thread => ({
        id: thread.id,
        title: thread.title || 'Untitled Conversation',
        created_at: thread.createdAt,
        updated_at: thread.updatedAt,
        database_id: thread.metadata?.database_id || this.database_id,
        table_name: thread.metadata?.table_name,
        metadata: thread.metadata || {},
        // Note: message count not available in thread object from storage
        message_count: 0
      }));
    } catch (error) {
      console.error('Failed to get user threads with metadata:', error)
      throw new Error(`Failed to get user threads with metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getAgent() {
    return this.agent
  }

  getMemory(): Memory {
    return this.memory
  }

  /**
   * Generate a smart, concise title for a conversation thread using AI
   * @param userQuery The user's natural language query
   * @returns A generated title or fallback title
   */
  async generateSmartTitle(userQuery: string): Promise<string> {
    try {
      // Create a lightweight agent instance just for title generation
      const titleAgent = new Agent({
        name: 'Title Generator',
        instructions: `You are a title generator for database conversations. 
        
        Your task is to create a short, descriptive title (3-6 words) that captures the essence of what the user is asking about their data.
        
        Rules:
        - Keep it under 50 characters
        - Make it specific to the query intent
        - Use action words when appropriate
        - Avoid generic terms like "query" or "data"
        - Focus on what the user wants to know or find
        
        Examples:
        - "show me all users" → "All Users Overview"
        - "count orders by status" → "Order Status Counts"
        - "find recent transactions" → "Recent Transactions"
        - "users with high scores" → "High Score Users"
        - "sales data for last month" → "Monthly Sales Data"
        
        Respond with ONLY the title, no additional text or formatting.`,
        model: openai('gpt-4o-mini'),
      });

      const result = await titleAgent.generate([
        {
          role: 'user',
          content: `Generate a concise title for this database query: "${userQuery}"`
        }
      ]);

      let title = result.text?.trim() || '';
      
      // Clean up the title
      title = title.replace(/['"]/g, ''); // Remove quotes
      title = title.replace(/\.$/, ''); // Remove trailing period
      
      // Ensure it's not too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Fallback to manual generation if AI fails or returns empty
      if (!title || title.length < 3) {
        return 'Chat';
      }
      
      return title;
    } catch (error) {
      console.error('Failed to generate smart title:', error);
      return 'Chat';
    }
  }


  
}
