import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  QueryCommand, 
  ScanCommand, 
  GetCommand 
} from '@aws-sdk/lib-dynamodb'
import { DatabaseSchema } from '@typings/query'

// Input schema for DynamoDB query parameters
const dynamoQueryInputSchema = z.object({
  operation: z.enum(['query', 'scan', 'get_item']).describe('DynamoDB operation to perform'),
  table_name: z.string().describe('Name of the DynamoDB table to query'),
  key_condition_expression: z.string().optional().describe('Key condition expression for Query operations'),
  filter_expression: z.string().optional().describe('Filter expression to apply additional conditions'),
  projection_expression: z.string().optional().describe('Projection expression to specify which attributes to return'),
  expression_attribute_names: z.record(z.string()).optional().describe('Expression attribute names mapping'),
  expression_attribute_values: z.record(z.any()).optional().describe('Expression attribute values mapping'),
  index_name: z.string().optional().describe('Name of the Global Secondary Index to use'),
  limit: z.number().optional().describe('Maximum number of items to return'),
  scan_index_forward: z.boolean().optional().describe('Whether to scan the index in ascending order'),
})

// Output schema for DynamoDB query results
const dynamoQueryOutputSchema = z.object({
  items: z.array(z.any()).describe('Array of items returned from the query'),
  count: z.number().describe('Number of items returned'),
  scannedCount: z.number().describe('Number of items scanned during the operation'),
  operation: z.enum(['query', 'scan', 'get_item']).describe('The operation that was performed'),
  performance: z.object({
    efficient: z.boolean().describe('Whether the query was efficient'),
    message: z.string().describe('Performance guidance message')
  }).describe('Performance analysis of the operation')
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
  schema: DatabaseSchema
}

export function createDynamoDBTool(config: DynamoDBToolConfig) {
  const { credentials, region = 'eu-central-1', schema } = config

  // Create DynamoDB client with user credentials
  const dynamoClient = new DynamoDBClient({
    region,
    credentials
  })
  const docClient = DynamoDBDocumentClient.from(dynamoClient)

  return createTool({
    id: 'dynamodb-query',
    description: `Query DynamoDB table "${schema.table_name}". Use this tool to execute DynamoDB operations based on natural language queries.
    
Table Schema:
- Primary Key: ${schema.primary_key.partition_key}${schema.primary_key.sort_key ? ` (partition), ${schema.primary_key.sort_key} (sort)` : ''}
- Indexes: ${schema.global_secondary_indexes?.map(gsi => `${gsi.index_name} (${gsi.partition_key}${gsi.sort_key ? `, ${gsi.sort_key}` : ''})`).join(', ') || 'None'}
- Attributes: ${schema.attributes.map(attr => `${attr.name} (${attr.type})`).join(', ')}

Guidelines:
- Use 'query' operation when you have partition key conditions for better performance
- Use 'scan' operation for full table scans (less efficient but necessary for complex filters)
- Use 'get_item' operation when you have the complete primary key
- Always prefer using indexes when possible for better performance
- Use filter expressions for additional conditions that can't be expressed in key conditions`,
    
    inputSchema: dynamoQueryInputSchema,
    outputSchema: dynamoQueryOutputSchema,
    
    execute: async ({ context: params }) => {
      try {
        console.log('Executing DynamoDB operation:', params)
        
        switch (params.operation) {
          case 'query':
            return await executeQuery(docClient, params)
          case 'scan':
            return await executeScan(docClient, params)
          case 'get_item':
            return await executeGetItem(docClient, params)
          default:
            throw new Error(`Unsupported operation: ${params.operation}`)
        }
      } catch (error) {
        console.error('DynamoDB tool execution error:', error)
        throw new Error(`DynamoDB operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  })
}

async function executeQuery(client: DynamoDBDocumentClient, params: DynamoQueryParams) {
  const command = new QueryCommand({
    TableName: params.table_name,
    KeyConditionExpression: params.key_condition_expression,
    FilterExpression: params.filter_expression,
    ProjectionExpression: params.projection_expression,
    ExpressionAttributeNames: params.expression_attribute_names,
    ExpressionAttributeValues: params.expression_attribute_values,
    IndexName: params.index_name,
    Limit: params.limit,
    ScanIndexForward: params.scan_index_forward,
  })

  const result = await client.send(command)
  
  return {
    items: result.Items || [],
    count: result.Count || 0,
    scannedCount: result.ScannedCount || 0,
    operation: 'query',
    performance: {
      efficient: (result.ScannedCount || 0) <= (result.Count || 0) * 2,
      message: (result.ScannedCount || 0) > (result.Count || 0) * 2 
        ? 'Query scanned many items. Consider optimizing with better key conditions.'
        : 'Query was efficient'
    }
  }
}

async function executeScan(client: DynamoDBDocumentClient, params: DynamoQueryParams) {
  const command = new ScanCommand({
    TableName: params.table_name,
    FilterExpression: params.filter_expression,
    ProjectionExpression: params.projection_expression,
    ExpressionAttributeNames: params.expression_attribute_names,
    ExpressionAttributeValues: params.expression_attribute_values,
    IndexName: params.index_name,
    Limit: params.limit,
  })

  const result = await client.send(command)
  
  return {
    items: result.Items || [],
    count: result.Count || 0,
    scannedCount: result.ScannedCount || 0,
    operation: 'scan',
    performance: {
      efficient: false,
      message: 'Scan operations read the entire table/index. Consider using Query with key conditions for better performance.'
    }
  }
}

async function executeGetItem(client: DynamoDBDocumentClient, params: DynamoQueryParams) {
  if (!params.expression_attribute_values) {
    throw new Error('GetItem operation requires key values in expression_attribute_values')
  }

  const command = new GetCommand({
    TableName: params.table_name,
    Key: params.expression_attribute_values,
    ProjectionExpression: params.projection_expression,
    ExpressionAttributeNames: params.expression_attribute_names,
  })

  const result = await client.send(command)
  
  return {
    items: result.Item ? [result.Item] : [],
    count: result.Item ? 1 : 0,
    scannedCount: 1,
    operation: 'get_item',
    performance: {
      efficient: true,
      message: 'GetItem is the most efficient operation for single item retrieval'
    }
  }
} 