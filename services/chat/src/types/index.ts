// Re-export main types used by the query service
export type { DynamoDBAgentConfig } from '../mastra/agents/dynamodb-agent-old'
export type { DynamoDBToolConfig, DynamoQueryParams, DynamoQueryResult } from '../mastra/tools/dynamodb-tool'
export type { Database, DynamoDBDatabaseSchema, SecureCredential } from '../adapters/secondary/integration/services'

// Main query interfaces
export interface QueryInput {
  database_id: string
  query: string
  context?: string
  limit?: number
}

export interface QueryResponse {
  success: boolean
  data?: {
    response: string
    results?: any[]
    metadata: {
      operation?: string
      count?: number
      scannedCount?: number
      performance?: {
        efficient: boolean
        message: string
      }
      reasoning: string
      confidence: number
      generatedQuery?: any
    }
  }
  error?: string
} 