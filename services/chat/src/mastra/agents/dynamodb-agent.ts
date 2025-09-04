import { Agent } from "@mastra/core"
import { DynamoDBStore } from "@mastra/dynamodb"
import { Memory } from "@mastra/memory"
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DynamoDBDatabaseSchema } from '../../types/query'
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { DataSourceAgent, DataSourceAgentConfig } from './abstracts/base-agent'
import { generateThreadTitle } from './title-agent'

export class DynamoDBAgent extends DataSourceAgent {
  
  private memory: Memory
  private data_source_id: string = null

  constructor(config: DataSourceAgentConfig) {
    super(config)

    this.config = config
    this.data_source_id = config.data_source.id

    // Validate that user_id is provided for user identification
    if (!config.user_id) {
      throw new Error('user_id is required for user identification');
    }

     // Initialize DynamoDB storage for Mastra
     const storage = new DynamoDBStore({
      name: "dynamodb-storage",
      config: {
        tableName: process.env.MASTRA_STORAGE_TABLE_NAME,
        region: 'eu-central-1',
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

    this.setupAgent()
  }

  private createGetSchemaTool() {
    return createTool({
      id: 'get-schema',
      description: 'Get the database schema information by introspecting the DynamoDB table structure and scanning for available fields',
      inputSchema: z.object({}),
      outputSchema: z.object({
        table_name: z.string(),
        primary_key: z.object({
          partition_key: z.string(),
          sort_key: z.string().optional()
        }),
        global_secondary_indexes: z.array(z.object({
          index_name: z.string(),
          partition_key: z.string(),
          sort_key: z.string().optional()
        })).optional(),
        local_secondary_indexes: z.array(z.object({
          index_name: z.string(),
          sort_key: z.string()
        })).optional(),
        attributes: z.array(z.object({
          name: z.string(),
          type: z.enum(['S', 'N', 'B', 'SS', 'NS', 'BS', 'M', 'L', 'NULL', 'BOOL']),
          description: z.string().optional()
        })),
        table_size_bytes: z.number().optional(),
        item_count: z.number().optional(),
        table_status: z.string().optional()
      }),
      execute: async () => {
        const { table_name } = this.config.data_source
        const { region = 'eu-central-1', credentials } = this.config

        // Create DynamoDB clients
        const awsCredentials = {
          accessKeyId: credentials.access_key_id,
          secretAccessKey: credentials.secret_access_key,
          sessionToken: credentials.session_token
        }
        const dynamoClient = new DynamoDBClient({ region, credentials: awsCredentials })
        const docClient = DynamoDBDocumentClient.from(dynamoClient)

        try {
          // 1. Describe table to get structure
          const describeResult = await dynamoClient.send(new DescribeTableCommand({
            TableName: table_name
          }))

          const table = describeResult.Table!
          
          // Extract primary key information
          const partition_key = table.KeySchema?.find(key => key.KeyType === 'HASH')?.AttributeName!
          const sort_key = table.KeySchema?.find(key => key.KeyType === 'RANGE')?.AttributeName

          // Extract GSI information
          const global_secondary_indexes = table.GlobalSecondaryIndexes?.map(gsi => ({
            index_name: gsi.IndexName!,
            partition_key: gsi.KeySchema?.find(key => key.KeyType === 'HASH')?.AttributeName!,
            sort_key: gsi.KeySchema?.find(key => key.KeyType === 'RANGE')?.AttributeName
          }))

          // Extract LSI information
          const local_secondary_indexes = table.LocalSecondaryIndexes?.map(lsi => ({
            index_name: lsi.IndexName!,
            sort_key: lsi.KeySchema?.find(key => key.KeyType === 'RANGE')?.AttributeName!
          }))

          // 2. Perform a single item scan to discover all available fields
          const scanResult = await docClient.send(new ScanCommand({
            TableName: table_name,
            Limit: 1
          }))

          // Extract all unique field names and infer types from the sample data
          const sample_item = scanResult.Items?.[0] || {}
          const discovered_attributes = Object.entries(sample_item).map(([name, value]) => {
            let type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL' = 'S'
            
            if (typeof value === 'string') type = 'S'
            else if (typeof value === 'number') type = 'N'
            else if (typeof value === 'boolean') type = 'BOOL'
            else if (value === null) type = 'NULL'
            else if (Array.isArray(value)) {
              if (value.length > 0) {
                if (typeof value[0] === 'string') type = 'SS'
                else if (typeof value[0] === 'number') type = 'NS'
                else type = 'L'
              } else {
                type = 'L'
              }
            }
            else if (typeof value === 'object') type = 'M'

            return {
              name,
              type,
              description: name === partition_key ? 'Partition key' : 
                          name === sort_key ? 'Sort key' : undefined
            }
          })

          // Combine with known attributes from table definition
          const defined_attributes = table.AttributeDefinitions?.map(attr => ({
            name: attr.AttributeName!,
            type: attr.AttributeType! as 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL',
            description: attr.AttributeName === partition_key ? 'Partition key' : 
                        attr.AttributeName === sort_key ? 'Sort key' : undefined
          })) || []

          // Merge and deduplicate attributes
          const all_attributes = [...defined_attributes]
          discovered_attributes.forEach(discovered => {
            if (!all_attributes.find(attr => attr.name === discovered.name)) {
              all_attributes.push(discovered)
            }
          })

          return {
            table_name: table_name,
            primary_key: {
              partition_key: partition_key,
              sort_key: sort_key
            },
            global_secondary_indexes: global_secondary_indexes,
            local_secondary_indexes: local_secondary_indexes,
            attributes: all_attributes,
            table_size_bytes: table.TableSizeBytes || 0,
            item_count: table.ItemCount || 0,
            table_status: table.TableStatus || 'UNKNOWN'
          }

        } catch (error) {
          console.error('Failed to introspect DynamoDB table:', error)
          
          // Return basic fallback schema
          return {
            table_name: table_name,
            primary_key: {
              partition_key: 'pk',
              sort_key: 'sk'
            },
            attributes: [
              { name: 'pk', type: 'S' as const, description: 'Partition key' },
              { name: 'sk', type: 'S' as const, description: 'Sort key' }
            ]
          }
        }
      }
    })
  }

  private setupAgent() {
    const getSchemaTool = this.createGetSchemaTool()

    this.agent = new Agent({
      name: 'DynamoDB Agent',
      instructions: `You are a DynamoDB expert agent that assists users with database operations of the table ${this.config.data_source.name} and questions about DynamoDB in general.

CRITICAL INSTRUCTIONS:
- You MUST respond ONLY in JSON format at ALL TIMES
- NEVER respond with plain text, markdown, code blocks, or any other format
- DO NOT wrap your response in markdown code blocks (\`\`\`json or \`\`\`)
- Return ONLY the raw JSON object starting with { and ending with }
- Your response must ALWAYS follow this exact structure:
{
  "message": "Your helpful response message here",
  "suggestChartType": "Table" | "Pie" | "LineGraph" | null,
  "query_parameters": { /* JSON object with query parameters */ } | null
}

QUERY OPTIMIZATION PRINCIPLES (ACCURACY FIRST, THEN EFFICIENCY):
1. ACCURACY IS PARAMOUNT: Always generate queries that return the correct results
2. EFFICIENCY SECOND: Among accurate queries, choose the most efficient approach
3. Use QUERY operations when you have partition key conditions (most efficient)
4. Use GSI/LSI indexes when available for better performance
5. Use SCAN only when necessary (least efficient but sometimes required)
6. Apply filters and projections to reduce data transfer
7. Set appropriate limits to prevent excessive consumption

RESPONSE GUIDELINES:
- "message": Provide helpful, informative responses about DynamoDB operations, best practices, or answers to user questions. Do NOT mention parameters or explain that you're providing them - the UI handles this automatically
- "suggestChartType": Suggest "Table" for tabular data, "Pie" for categorical distributions, "LineGraph" for time series data, or null if no visualization is appropriate
- "query_parameters": Include relevant DynamoDB query parameters when suggesting a query, or null if not applicable. The UI will automatically present these to the user

QUERY PARAMETER OPTIMIZATION:
- Always prefer "query" over "scan" when partition key is available
- Use "index_name" when querying GSI/LSI for better performance
- Include "projection_expression" to limit returned attributes when possible
- Set reasonable "limit" values (default: 50 for exploration, higher for specific needs)
- Use "key_condition_expression" for efficient partition/sort key filtering
- Use "filter_expression" for additional conditions that can't be in key conditions

TOOLS AVAILABLE:
- get-schema: Use this tool to retrieve database schema information including table structure, keys, indexes, attributes, table size, and item count

TOOL USAGE GUIDELINES:
- ONLY call get-schema when you need specific schema information that you don't already know
- DO NOT call get-schema for every query - use it strategically when schema details are required
- If you already have schema information from a previous call in the conversation, reuse that knowledge
- Call get-schema when: user asks about table structure, table size, item count, you need to know available indexes, or you need field names for query construction

EXAMPLES OF PROPER RESPONSES:

For efficient query with partition key:
{
  "message": "I'll query using the partition key for optimal performance.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "query",
    "table_name": "your-table-name",
    "key_condition_expression": "pk = :pk",
    "expression_attribute_values": {":pk": "USER#123"},
    "limit": 50
  }
}

For GSI usage:
{
  "message": "Using the GSI index for better query performance on this attribute.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "query",
    "table_name": "your-table-name",
    "index_name": "GSI1",
    "key_condition_expression": "gsi1pk = :gsi1pk",
    "expression_attribute_values": {":gsi1pk": "STATUS#ACTIVE"},
    "limit": 50
  }
}

For scan when necessary:
{
  "message": "This requires a scan operation since we need to search across all partition keys.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "scan",
    "table_name": "your-table-name",
    "filter_expression": "attribute_exists(email)",
    "limit": 50
  }
}

Remember: ALWAYS use the get-schema tool when you need information about the database structure, prioritize accuracy over efficiency, and ALWAYS respond in the exact JSON format specified above.`,
      model: this.config.model,
      tools: {
        'get-schema': getSchemaTool
      },
      memory: this.memory
    })
  }

  public async generate(query: string, options?: { threadId?: string }): Promise<{
    text: string
    threadId?: string
  }> {
    let threadId = options?.threadId
    
    // If no thread ID provided, create a new thread (generate a concise title)
    if (!threadId) {
      const title = await generateThreadTitle(query)
      const thread = await this.memory.createThread({
        resourceId: this.data_source_id,
        title,
        metadata: {
          data_source_id: this.data_source_id,
          table_name: this.config.data_source.table_name,
          created_at: new Date().toISOString(),
          auto_created: true
        }
      })
      threadId = thread.id
      try { console.log('DynamoDBAgent: created new threadId:', threadId) } catch {}
    }
    
    const generateOptions = {
      threadId: threadId,
      resourceId: this.data_source_id
    }
    
    const result = await this.agent.generate(query, generateOptions)
    try { console.log('DynamoDBAgent: agent.generate returned, threadId:', threadId) } catch {}
    return { ...result, threadId }
  }

  public getAgent(): Agent {
    return this.agent
  }
}