export type QueryType = 'scan' | 'query' | 'get_item' | 'batch_get'

export type QueryInput = {
  user_id: string
  database_id: string
  natural_language_query: string
  context?: string
  max_results?: number
}

export type QueryResult = {
  id: string
  user_id: string
  database_id: string
  natural_language_query: string
  generated_query: DynamoDBQuery
  results: any[]
  total_count: number
  execution_time_ms: number
  tokens_used?: number
  created_at: string
  metadata?: QueryMetadata
}

export type DynamoDBQuery = {
  operation: QueryType
  table_name: string
  key_condition_expression?: string
  filter_expression?: string
  projection_expression?: string
  expression_attribute_names?: Record<string, string>
  expression_attribute_values?: Record<string, any>
  index_name?: string
  limit?: number
  scan_index_forward?: boolean
  select?: string
}

export type QueryMetadata = {
  confidence_score?: number
  reasoning?: string
  ai_response?: string
  alternative_queries?: DynamoDBQuery[]
  warnings?: string[]
  suggestions?: string[]
}

export type QueryHistory = {
  user_id: string
  queries: QueryResult[]
  total_queries: number
  last_query_at: string
}

export type DynamoDBDatabaseSchema = {
  table_name: string
  primary_key: {
    partition_key: string
    sort_key?: string
  }
  global_secondary_indexes?: Array<{
    index_name: string
    partition_key: string
    sort_key?: string
  }>
  local_secondary_indexes?: Array<{
    index_name: string
    sort_key: string
  }>
  attributes: Array<{
    name: string
    type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL'
    description?: string
  }>
  table_size_bytes?: number
  item_count?: number
  table_status?: string
} 