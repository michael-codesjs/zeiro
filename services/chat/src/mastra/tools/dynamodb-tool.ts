import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  ScanCommand
} from '@aws-sdk/lib-dynamodb'

// Simple input schema for DynamoDB queries
const dynamoQueryInputSchema = z.object({
  operation: z.enum(['scan', 'query']).describe('DynamoDB operation to perform'),
  table_name: z.string().describe('Name of the DynamoDB table'),
  limit: z.number().optional().describe('Maximum number of items to return (default: 10)'),
})

// Simple output schema 
const dynamoQueryOutputSchema = z.object({
  items: z.array(z.any()).describe('Array of items returned'),
  count: z.number().describe('Number of items returned'),
  operation: z.string().describe('Operation performed'),
})

export type DynamoQueryParams = z.infer<typeof dynamoQueryInputSchema>
export type DynamoQueryResult = z.infer<typeof dynamoQueryOutputSchema>

export interface DynamoDBToolConfig {
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  region?: string
  tableName: string
  tableSchema: {
    primaryKey: {
      partitionKey: string
      sortKey?: string
    }
    globalSecondaryIndexes?: Array<{
      indexName: string
      partitionKey: string
      sortKey?: string
    }>
    attributes: Array<{
      name: string
      type: string
      description?: string
    }>
  }
}

// Global configuration for the DynamoDB tool
let dynamoDBConfig: DynamoDBToolConfig | null = null

// Configure the DynamoDB tool with credentials and schema
export function configureDynamoDBTool(config: DynamoDBToolConfig) {
  dynamoDBConfig = config
}

// Singleton DynamoDB tool instance
export const dynamoDBTool = createTool({
  id: 'dynamodb-query',
  description: 'Simple DynamoDB query tool. Use "scan" to get all items or "query" for basic queries.',
  
  inputSchema: dynamoQueryInputSchema,
  outputSchema: dynamoQueryOutputSchema,
  
  execute: async ({ context: params }) => {
    if (!dynamoDBConfig) {
      throw new Error('DynamoDB tool not configured')
    }

    const { credentials, region = 'eu-central-1', tableName } = dynamoDBConfig

    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({ region, credentials })
    const docClient = DynamoDBDocumentClient.from(dynamoClient)

    try {
      const limit = params.limit || 10
      
      if (params.operation === 'scan') {
        const result = await docClient.send(new ScanCommand({
          TableName: tableName,
          Limit: limit
        }))
        
        return {
          items: result.Items || [],
          count: result.Count || 0,
          operation: 'scan'
        }
      } else {
        // For now, query just does a scan (we'll extend this later)
        const result = await docClient.send(new ScanCommand({
          TableName: tableName,
          Limit: limit
        }))
        
        return {
          items: result.Items || [],
          count: result.Count || 0,
          operation: 'query'
        }
      }
    } catch (error) {
      console.error('DynamoDB operation failed:', error)
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
})

// Helper function to get current table info for descriptions
export function getDynamoDBToolDescription(): string {
  if (!dynamoDBConfig) {
    return 'DynamoDB tool not configured'
  }

  const { tableName, tableSchema } = dynamoDBConfig
  
  return `Query DynamoDB table "${tableName}". Use this tool to execute DynamoDB operations based on natural language queries.
    
Table Schema:
- Primary Key: ${tableSchema.primaryKey.partitionKey}${tableSchema.primaryKey.sortKey ? ` (partition), ${tableSchema.primaryKey.sortKey} (sort)` : ''}
- Indexes: ${tableSchema.globalSecondaryIndexes?.map(gsi => `${gsi.indexName} (${gsi.partitionKey}${gsi.sortKey ? `, ${gsi.sortKey}` : ''})`).join(', ') || 'None'}
- Attributes: ${tableSchema.attributes.map(attr => `${attr.name} (${attr.type})`).join(', ')}

Guidelines:
- Use 'query' operation when you have partition key conditions for better performance
- Use 'scan' operation for full table scans (less efficient but necessary for complex filters)
- Use 'get_item' operation when you have the complete primary key
- Always prefer using indexes when possible for better performance
- Use filter expressions for additional conditions that can't be expressed in key conditions`
}

 