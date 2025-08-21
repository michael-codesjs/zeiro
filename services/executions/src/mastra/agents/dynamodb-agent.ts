import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { DynamoDBStore } from "@mastra/dynamodb";
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { 
  DynamoDBClient, 
  DescribeTableCommand,
  ListTablesCommand,
  DescribeTimeToLiveCommand
} from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  ScanCommand,
  QueryCommand,
  GetCommand,
  BatchGetCommand
} from '@aws-sdk/lib-dynamodb'
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

// Simplified configuration
export type QueryAgentConfig = {
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  database: {
    id: string
    name: string
  }
  model: string  // Changed from Parameters<typeof openai>[0] to string to support both providers
  region?: string
  table_name: string
}

// Enhanced table schema with discovered fields
export type TableSchema = {
  tableName: string
  primaryKey: {
    partitionKey: string
    sortKey?: string
  }
  globalSecondaryIndexes: Array<{
    indexName: string
    partitionKey: string
    sortKey?: string
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
    projectedAttributes?: string[]
  }>
  localSecondaryIndexes: Array<{
    indexName: string
    sortKey: string
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
    projectedAttributes?: string[]
  }>
  // Schema-defined attributes (keys only)
  attributes: Array<{
    name: string
    type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL'
    isKey?: boolean
    isIndexKey?: boolean
  }>
  // All discovered fields from sample data
  discoveredFields: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
    isKey?: boolean
    isIndexKey?: boolean
    sampleValue?: any
    nestedFields?: string[] // For objects, list of nested field paths
  }>
  tableStatus: string
  itemCount?: number
  tableSizeBytes?: number
  billingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST'
  timeToLive?: {
    attributeName: string
    enabled: boolean
  }
  fieldDiscovery?: {
    sampleScanned: boolean
    scanDate: string
    totalFieldsFound: number
  }
}

// Query generation result (what the agent returns)
export type QueryGenerationResult = {
  queryGenerated: boolean
  responseType: 'query' | 'conversation'
  
  // For query responses
  operation?: 'scan' | 'query' | 'get-item' | 'batch-get'
  parameters?: {
    TableName: string
    Key?: Record<string, any>
    KeyConditionExpression?: string
    FilterExpression?: string
    ProjectionExpression?: string
    ExpressionAttributeNames?: Record<string, string>
    ExpressionAttributeValues?: Record<string, any>
    IndexName?: string
    Limit?: number
    ExclusiveStartKey?: Record<string, any>
    ConsistentRead?: boolean
    ScanIndexForward?: boolean
    RequestItems?: Record<string, any>
    ReturnConsumedCapacity?: string
  }
  
  // For both query and conversation responses
  explanation?: string
  suggestedChartType?: 'Table' | 'BarChart' | 'PieChart' | 'LineChart' | 'AreaChart' | 'ScatterPlot' | 'Message'
  title?: string
  
  // For conversation responses
  conversationResponse?: string
  
  // Common fields
  fieldValidation?: {
    valid: boolean
    availableFields?: string[]
    message?: string
  }
  error?: string
  suggestions?: string[]
}

// Schema input
const schemaInputSchema = z.object({
  tableName: z.string().describe('Name of the table to analyze'),
})

export class DynamoDBQueryAgent {

  private agent: Agent
  private memory: Memory | null = null
  private config: QueryAgentConfig
  private schemaTool: any
  private tableSchema: TableSchema | null = null

  private current_thread_id: string | null = null
  private database_id: string | null = null

  constructor(config: QueryAgentConfig) {

    this.config = config
    this.database_id = config.database?.id || null
    
    // Initialize DynamoDB storage for Mastra using the same credentials as the agent
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

    this.schemaTool = this.createSchemaTool()
    
    // Create a structured response tool
    const respondTool = createTool({
      id: 'respondToUser',
      description: 'Respond to the user with either a conversation or query generation result',
      inputSchema: z.object({
        queryGenerated: z.boolean().describe('Whether a DynamoDB query was generated'),
        responseType: z.enum(['conversation', 'query']).describe('Type of response'),
        
        // For conversation responses
        conversationResponse: z.string().optional().describe('Conversational message for the user'),
        
        // For query responses
        operation: z.enum(['scan', 'query', 'get-item', 'batch-get']).optional().describe('DynamoDB operation type'),
        parameters: z.record(z.any()).optional().describe('Complete DynamoDB operation parameters'),
        
        // Common fields
        explanation: z.string().optional().describe('Brief explanation of the response or query'),
        suggestedChartType: z.enum(['Table', 'BarChart', 'PieChart', 'LineChart', 'AreaChart', 'ScatterPlot', 'Message']).describe('Suggested visualization type'),
        title: z.string().describe('Title for the results or response'),
        suggestions: z.array(z.string()).optional().describe('Follow-up suggestions for the user'),
        availableFields: z.array(z.string()).optional().describe('Available fields in the table')
      }),
      outputSchema: z.object({
        success: z.boolean(),
        response: z.object({
          queryGenerated: z.boolean(),
          responseType: z.string(),
          conversationResponse: z.string().optional(),
          operation: z.string().optional(),
          parameters: z.record(z.any()).optional(),
          explanation: z.string().optional(),
          suggestedChartType: z.string(),
          title: z.string(),
          suggestions: z.array(z.string()).optional(),
          fieldValidation: z.object({
            valid: z.boolean(),
            availableFields: z.array(z.string()).optional()
          }).optional()
        })
      }),
      execute: async ({ context: input }) => {
        // Return the structured response
        return {
          success: true,
          response: {
            queryGenerated: input.queryGenerated,
            responseType: input.responseType,
            conversationResponse: input.conversationResponse,
            operation: input.operation,
            parameters: input.parameters,
            explanation: input.explanation,
            suggestedChartType: input.suggestedChartType,
            title: input.title,
            suggestions: input.suggestions,
            fieldValidation: {
              valid: true,
              availableFields: input.availableFields || this.tableSchema?.discoveredFields.map(f => f.name) || []
            }
          }
        };
      }
    });

    this.agent = new Agent({
      name: 'DynamoDB Query Generator & Assistant',
      instructions: `You are a DynamoDB query generation assistant for the ${config.table_name} table.

CRITICAL: You MUST ALWAYS call respondToUser tool for every response. Never provide a direct text response.

YOUR ROLE:
- Generate DynamoDB query parameters when users want to retrieve data  
- Answer questions about table structure and capabilities
- You generate queries but DO NOT execute them - the system handles execution

MANDATORY WORKFLOW:
1. If you haven't called getDataSchema yet, call it first
2. Analyze the user's request
3. ALWAYS call respondToUser tool with your response (this is mandatory)

WHEN USER WANTS DATA (like "show all", "list items", "get data"):
Use respondToUser with:
- queryGenerated: true
- responseType: "query"
- operation: "scan" (for "show all") or "query" (when partition key specified)
- parameters: Complete DynamoDB parameters including TableName and Limit
- explanation: Brief description
- suggestedChartType: "Table"
- title: Descriptive title

Example for "show all items":
Call respondToUser with:
- queryGenerated: true
- responseType: "query"
- operation: "scan"
- parameters: {"TableName": "${config.table_name}", "Limit": 10}
- explanation: "Retrieving all items from the table"
- suggestedChartType: "Table"
- title: "All Items"

WHEN USER ASKS QUESTIONS (about schema, capabilities):
Use respondToUser with:
- queryGenerated: false
- responseType: "conversation"
- conversationResponse: Your helpful answer
- suggestedChartType: "Message"
- title: "Information"

CRITICAL RULES:
- NEVER provide a direct text response
- ALWAYS use respondToUser tool for every interaction
- For any data request, generate query parameters
- Include complete DynamoDB parameters with TableName
- Default Limit: 10 for scans, 50 max`,
      model: getModelConfig(this.config.model),
      tools: { 
        getDataSchema: this.schemaTool,
        respondToUser: respondTool
      },
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
        table_name: thread.metadata?.table_name || this.config.table_name
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
        table_name: thread.metadata?.table_name || this.config.table_name,
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
        model: getModelConfig(this.config.model),
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
        return this.generateFallbackTitle(userQuery);
      }
      
      return title;
    } catch (error) {
      console.error('Failed to generate smart title:', error);
      return this.generateFallbackTitle(userQuery);
    }
  }

  /**
   * Generate a fallback title when AI generation fails
   * @param query The user's query
   * @returns A fallback title
   */
  private generateFallbackTitle(query: string): string {
    // Remove common query prefixes and clean up
    let title = query
      .replace(/^(show me|give me|get|find|list|display|what|how|why|when|where|can you|could you|please|i want|i need)/i, '')
      .trim();
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Truncate if too long
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Fallback titles for common patterns
    if (title.length < 5) {
      if (query.toLowerCase().includes('count')) return 'Count Analysis';
      if (query.toLowerCase().includes('sum')) return 'Sum Calculation';
      if (query.toLowerCase().includes('average')) return 'Average Analysis';
      if (query.toLowerCase().includes('recent')) return 'Recent Data';
      if (query.toLowerCase().includes('user')) return 'User Data';
      if (query.toLowerCase().includes('order')) return 'Order Data';
      return 'Data Query';
    }
    
    return title;
  }

  /**
   * Extract all fields from a DynamoDB item, including nested fields
   * @param item The DynamoDB item to analyze
   * @param keyAttributes Set of key attribute names
   * @param prefix Prefix for nested field paths
   * @returns Array of discovered field metadata
   */
  private extractFieldsFromItem(
    item: Record<string, any>, 
    keyAttributes: Set<string>, 
    prefix: string = ''
  ): TableSchema['discoveredFields'] {
    const fields: TableSchema['discoveredFields'] = []
    
    for (const [key, value] of Object.entries(item)) {
      const fieldName = prefix ? `${prefix}.${key}` : key
      const isKey = keyAttributes.has(key)
      const isIndexKey = keyAttributes.has(key)
      
      // Determine the type and extract nested fields if applicable
      let fieldType: string
      let nestedFields: string[] | undefined
      let sampleValue: any = value
      
      if (value === null || value === undefined) {
        fieldType = 'null'
      } else if (typeof value === 'string') {
        fieldType = 'string'
        // Truncate long strings for sample value
        if (value.length > 100) {
          sampleValue = value.substring(0, 100) + '...'
        }
      } else if (typeof value === 'number') {
        fieldType = 'number'
      } else if (typeof value === 'boolean') {
        fieldType = 'boolean'
      } else if (Array.isArray(value)) {
        fieldType = 'array'
        // For arrays, show the type of first element and length
        if (value.length > 0) {
          sampleValue = `Array(${value.length}) [${typeof value[0]}]`
        } else {
          sampleValue = 'Array(0) []'
        }
      } else if (typeof value === 'object') {
        fieldType = 'object'
        // For objects, recursively extract nested fields
        const nestedFieldData = this.extractFieldsFromItem(value, new Set(), fieldName)
        nestedFields = nestedFieldData.map(f => f.name)
        fields.push(...nestedFieldData)
        
        // Show object structure as sample value
        const keys = Object.keys(value)
        sampleValue = `Object {${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`
      } else {
        fieldType = 'string' // fallback
        sampleValue = String(value)
      }
      
      fields.push({
        name: fieldName,
        type: fieldType as any,
        isKey: prefix === '' ? isKey : false, // Only top-level fields can be keys
        isIndexKey: prefix === '' ? isIndexKey : false,
        sampleValue,
        nestedFields
      })
    }
    
    return fields
  }

  private createSchemaTool() {
    const { credentials, region = 'eu-central-1', table_name } = this.config

    return createTool({
      id: 'getDataSchema',
      description: `Get table structure information for the "${table_name}" table. Call this first to understand the table.`,
      
      inputSchema: schemaInputSchema,
      outputSchema: z.object({
        tableName: z.string(),
        primaryKey: z.object({
          partitionKey: z.string(),
          sortKey: z.string().optional()
        }),
        globalSecondaryIndexes: z.array(z.object({
          indexName: z.string(),
          partitionKey: z.string(),
          sortKey: z.string().optional(),
          projectionType: z.string(),
          projectedAttributes: z.array(z.string()).optional()
        })),
        localSecondaryIndexes: z.array(z.object({
          indexName: z.string(),
          sortKey: z.string(),
          projectionType: z.string(),
          projectedAttributes: z.array(z.string()).optional()
        })),
        attributes: z.array(z.object({
          name: z.string(),
          type: z.string(),
          isKey: z.boolean().optional(),
          isIndexKey: z.boolean().optional()
        })),
        discoveredFields: z.array(z.object({
          name: z.string(),
          type: z.string(),
          isKey: z.boolean().optional(),
          isIndexKey: z.boolean().optional(),
          sampleValue: z.any().optional(),
          nestedFields: z.array(z.string()).optional()
        })),
        tableStatus: z.string(),
        itemCount: z.number().optional(),
        tableSizeBytes: z.number().optional(),
        billingMode: z.string().optional(),
        timeToLive: z.object({
          attributeName: z.string(),
          enabled: z.boolean()
        }).optional(),
        fieldDiscovery: z.object({
          sampleScanned: z.boolean(),
          scanDate: z.string(),
          totalFieldsFound: z.number()
        }).optional(),
        cached: z.boolean()
      }),
      
      execute: async ({ context: params }) => {
        // Return cached schema if available
        if (this.tableSchema && this.tableSchema.tableName === params.tableName) {
          return {
            ...this.tableSchema,
            cached: true
          }
        }

        const dynamoClient = new DynamoDBClient({ region, credentials })

        try {
          // Get table description
          const describeResult = await dynamoClient.send(new DescribeTableCommand({
            TableName: params.tableName
          }))

          const table = describeResult.Table!
          
          // Extract primary key
          const keySchema = table.KeySchema || []
          const partitionKey = keySchema.find(key => key.KeyType === 'HASH')?.AttributeName!
          const sortKey = keySchema.find(key => key.KeyType === 'RANGE')?.AttributeName

          // Extract GSIs
          const globalSecondaryIndexes = (table.GlobalSecondaryIndexes || []).map(gsi => ({
            indexName: gsi.IndexName!,
            partitionKey: gsi.KeySchema!.find(key => key.KeyType === 'HASH')?.AttributeName!,
            sortKey: gsi.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName,
            projectionType: gsi.Projection?.ProjectionType || 'ALL',
            projectedAttributes: gsi.Projection?.NonKeyAttributes
          }))

          // Extract LSIs with enhanced metadata
          const localSecondaryIndexes = (table.LocalSecondaryIndexes || []).map(lsi => ({
            indexName: lsi.IndexName!,
            sortKey: lsi.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName!,
            projectionType: lsi.Projection?.ProjectionType || 'ALL',
            projectedAttributes: lsi.Projection?.NonKeyAttributes
          }))

          // Extract attributes with enhanced metadata
          const keyAttributes = new Set([partitionKey, sortKey, ...globalSecondaryIndexes.flatMap(gsi => [gsi.partitionKey, gsi.sortKey].filter(Boolean))]);
          const attributes = (table.AttributeDefinitions || []).map(attr => ({
            name: attr.AttributeName!,
            type: attr.AttributeType!,
            isKey: attr.AttributeName === partitionKey || attr.AttributeName === sortKey,
            isIndexKey: keyAttributes.has(attr.AttributeName!)
          }))

          // Get TTL information
          let timeToLive;
          try {
            const ttlResult = await dynamoClient.send(new DescribeTimeToLiveCommand({
              TableName: params.tableName
            }));
            if (ttlResult.TimeToLiveDescription?.TimeToLiveStatus === 'ENABLED') {
              timeToLive = {
                attributeName: ttlResult.TimeToLiveDescription.AttributeName!,
                enabled: true
              };
            }
          } catch (error) {
            // TTL not configured, which is fine
          }

          // Discover all available fields by scanning one item
          const docClient = DynamoDBDocumentClient.from(dynamoClient)
          let discoveredFields: TableSchema['discoveredFields'] = []
          let fieldDiscovery: TableSchema['fieldDiscovery'] = {
            sampleScanned: false,
            scanDate: new Date().toISOString(),
            totalFieldsFound: 0
          }

          try {
            // Scan for one item to discover all available fields
            const sampleResult = await docClient.send(new ScanCommand({
              TableName: params.tableName,
              Limit: 1
            }))

            if (sampleResult.Items && sampleResult.Items.length > 0) {
              const sampleItem = sampleResult.Items[0]
              discoveredFields = this.extractFieldsFromItem(sampleItem, keyAttributes)
              fieldDiscovery = {
                sampleScanned: true,
                scanDate: new Date().toISOString(),
                totalFieldsFound: discoveredFields.length
              }
            }
          } catch (error) {
            console.warn('Failed to discover fields from sample item:', error)
            // Continue without field discovery - we'll still have the schema attributes
          }

          const schema: TableSchema = {
            tableName: params.tableName,
            primaryKey: { partitionKey, sortKey },
            globalSecondaryIndexes,
            localSecondaryIndexes,
            attributes,
            discoveredFields,
            tableStatus: table.TableStatus!,
            itemCount: table.ItemCount,
            tableSizeBytes: table.TableSizeBytes,
            billingMode: table.BillingModeSummary?.BillingMode,
            timeToLive,
            fieldDiscovery
          }

          // Cache the schema
          this.tableSchema = schema
          
          return {
            ...schema,
            cached: false
          }
        } catch (error) {
          console.error('Failed to fetch table schema:', error)
          throw new Error(`Failed to describe table ${params.tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    })
  }

  // Method to execute a query using generated parameters
  async executeQuery(queryParams: any): Promise<any> {
    const { credentials, region = 'eu-central-1' } = this.config
        const dynamoClient = new DynamoDBClient({ region, credentials })
        const docClient = DynamoDBDocumentClient.from(dynamoClient)

        try {
          let result: any;
      
      // Determine operation type from parameters
      if (queryParams.Key) {
        // GetItem operation
        result = await docClient.send(new GetCommand(queryParams))
              return {
                items: result.Item ? [result.Item] : [],
                count: result.Item ? 1 : 0,
                operation: 'get-item',
                lastEvaluatedKey: null,
                consumedCapacity: result.ConsumedCapacity
              }
      } else if (queryParams.KeyConditionExpression) {
        // Query operation
              result = await docClient.send(new QueryCommand(queryParams))
      } else if (queryParams.RequestItems) {
        // BatchGet operation
        result = await docClient.send(new BatchGetCommand(queryParams))
              return {
          items: result.Responses?.[this.config.table_name] || [],
          count: result.Responses?.[this.config.table_name]?.length || 0,
                operation: 'batch-get',
                lastEvaluatedKey: null,
                consumedCapacity: result.ConsumedCapacity?.[0]
              }
      } else {
        // Scan operation
        result = await docClient.send(new ScanCommand(queryParams))
          }
          
          return {
            items: result.Items || [],
            count: result.Count || 0,
        operation: queryParams.KeyConditionExpression ? 'query' : 'scan',
            lastEvaluatedKey: result.LastEvaluatedKey || null,
            consumedCapacity: result.ConsumedCapacity
          }
        } catch (error) {
      console.error('Query execution failed:', error)
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate query parameters only (no execution)
  async generateQuery(naturalLanguageQuery: string, options?: { threadId?: string }): Promise<QueryGenerationResult> {
    try {
      // Determine generate options based on memory availability
      const generateOptions: any = {};
      
      // If we have memory and a thread ID, pass it to the agent for message persistence
      if (this.memory && (options?.threadId || this.current_thread_id)) {
        generateOptions.threadId = options?.threadId || this.current_thread_id;
        generateOptions.resourceId = this.database_id;
        
        console.log('Generate query with memory context:', {
          threadId: generateOptions.threadId,
          resourceId: generateOptions.resourceId,
          memoryEnabled: !!this.memory
        });
      } else {
        console.log('Generate query without memory context:', {
          hasMemory: !!this.memory,
          threadId: options?.threadId,
          currentThreadId: this.current_thread_id
        });
      }

      let result;
      try {
        result = await this.agent.generate([
          {
            role: 'user',
            content: naturalLanguageQuery
          }
        ], {
          ...generateOptions,
          maxSteps: 5, // Allow multiple tool calls
        })
      } catch (error) {
          throw error;
      }
      
      console.log('Agent generate result:', {
        hasText: !!result.text,
        hasToolCalls: !!result.toolCalls?.length,
        threadIdUsed: generateOptions.threadId
      });
      
      // Extract structured response from tool calls
      let parsedResponse: QueryGenerationResult;
      
      console.log('Agent tool calls:', result.toolCalls?.length || 0);
      console.log('Agent response text:', result.text);
      
      // Look for respondToUser tool call
      const respondToolCall = result.toolCalls?.find(call => call.toolName === 'respondToUser');
      
      if (respondToolCall && respondToolCall.result) {
        console.log('Found respondToUser tool result:', respondToolCall.result);
        const toolResult = respondToolCall.result as any;
        
        if (toolResult.success && toolResult.response) {
          const response = toolResult.response;
          parsedResponse = {
            queryGenerated: response.queryGenerated,
            responseType: response.responseType,
            operation: response.operation,
            parameters: response.parameters,
            explanation: response.explanation,
            suggestedChartType: response.suggestedChartType,
            title: response.title,
            conversationResponse: response.conversationResponse,
            fieldValidation: response.fieldValidation,
            suggestions: response.suggestions
          };
          console.log('Successfully extracted tool response:', parsedResponse);
        } else {
          throw new Error('Tool result was not successful');
        }
      } else {
        // Fallback - force a query generation for data requests
        console.warn('No respondToUser tool call found, analyzing intent and generating fallback');
        
        // Check if this looks like a data request
        const lowerQuery = naturalLanguageQuery.toLowerCase();
        const isDataRequest = lowerQuery.includes('show') || lowerQuery.includes('get') || 
                             lowerQuery.includes('all') || lowerQuery.includes('list') ||
                             lowerQuery.includes('find') || lowerQuery.includes('select');
        
        if (isDataRequest) {
          // Generate a basic scan query as fallback
          parsedResponse = {
            queryGenerated: true,
            responseType: 'query',
            operation: 'scan',
            parameters: {
              TableName: this.config.table_name,
              Limit: 10
            },
            explanation: "Retrieving items from the table",
            suggestedChartType: 'Table',
            title: 'Query Results',
            fieldValidation: {
              valid: true,
              availableFields: this.tableSchema?.discoveredFields.map(field => field.name) || 
                             this.tableSchema?.attributes.map(attr => attr.name) || []
            }
          };
        } else {
          // Fallback to conversation
          parsedResponse = {
            queryGenerated: false,
            responseType: 'conversation',
            conversationResponse: result.text || "I didn't use the proper response format. Please try again.",
            suggestedChartType: 'Message',
            title: 'Response',
            suggestions: ["Try rephrasing your question"],
            fieldValidation: {
              valid: false,
              availableFields: this.tableSchema?.discoveredFields.map(field => field.name) || 
                             this.tableSchema?.attributes.map(attr => attr.name) || [],
              message: "Agent didn't use the respondToUser tool"
            }
          };
        }
      }

      // Ensure basic required fields and add metadata
      const finalResponse: QueryGenerationResult = {
        queryGenerated: parsedResponse.queryGenerated || false,
        responseType: parsedResponse.responseType || 'conversation',
        operation: parsedResponse.operation,
        parameters: parsedResponse.parameters,
        explanation: parsedResponse.explanation || '',
        suggestedChartType: parsedResponse.suggestedChartType || 'Message',
        title: parsedResponse.title || 'Query Result',
        conversationResponse: parsedResponse.conversationResponse,
        fieldValidation: parsedResponse.fieldValidation || { valid: true },
        error: parsedResponse.error,
        suggestions: parsedResponse.suggestions || []
      };

      return finalResponse;
    } catch (error) {
      console.error('Query generation error:', error)
      
      return {
        queryGenerated: false,
        responseType: 'conversation',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        conversationResponse: error instanceof Error ? `I encountered an error: ${error.message}` : 'An unknown error occurred while processing your request.',
        suggestions: ["Try rephrasing your question"],
        fieldValidation: {
          valid: false,
          availableFields: this.tableSchema?.discoveredFields.map(field => field.name) || 
                         this.tableSchema?.attributes.map(attr => attr.name) || [],
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  // Legacy method for backward compatibility - now just calls generateQuery
  async query(naturalLanguageQuery: string, options?: { threadId?: string }) {
    const result = await this.generateQuery(naturalLanguageQuery, options);
    
    // Transform to legacy format for backward compatibility
      return {
      response: result.explanation || result.error || 'Query generated',
      queryGenerated: result.queryGenerated,
      queryParameters: result.parameters,
      operation: result.operation,
      explanation: result.explanation,
      suggestedChartType: result.suggestedChartType,
      title: result.title,
      fieldValidation: result.fieldValidation,
      error: result.error,
        threadId: this.memory ? (options?.threadId || this.current_thread_id) : undefined,
      resourceId: this.memory ? this.database_id : undefined,
      availableFields: this.tableSchema?.discoveredFields.map(field => field.name) || 
                       this.tableSchema?.attributes.map(attr => attr.name) || [],
      suggestions: result.suggestions || []
    }
  }
}
