import { useMutation } from '@tanstack/react-query'
import { post } from 'aws-amplify/api'

export interface FilterCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'begins_with' | 'between' | 'exists' | 'not_exists' | 'in' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
  value?: any
  values?: any[] // For 'in' and 'between' operators
}

export interface ManualQueryParams {
  database_id: string
  operation: 'scan' | 'query' | 'get-item' | 'batch-get'
  table_name: string
  
  // Key conditions (for Query operation)
  partition_key?: {
    name: string
    value: any
  }
  sort_key?: {
    name: string
    operator: 'equals' | 'begins_with' | 'between' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
    value?: any
    values?: any[] // For between operator
  }
  
  // Filter conditions (applied after key conditions)
  filters?: FilterCondition[]
  
  // Projection (which fields to return)
  projection?: string[]
  
  // Index name (for GSI/LSI queries)
  index_name?: string
  
  // Pagination
  limit?: number
  exclusive_start_key?: Record<string, any>
  
  // Other options
  consistent_read?: boolean
  scan_index_forward?: boolean
  
  // For GetItem operation
  key?: Record<string, any>
  
  // For BatchGet operation
  keys?: Record<string, any>[]
}

export interface CreateDynamodbQueryResult {
  execution_id: string
  status: 'pending_approval'
  operation: string
  message: string
}

export interface CreateDynamodbQueryResponse {
  success: boolean
  data?: CreateDynamodbQueryResult
  error?: string
}

export const useCreateDynamodbQuery = () => {
  return useMutation<CreateDynamodbQueryResponse, Error, ManualQueryParams>({
    mutationFn: async (params: ManualQueryParams) => {
      try {
        const restOperation = post({
          apiName: 'zeiro-api',
          path: '/executions/create-dynamodb-query',
          options: {
            body: params as any
          }
        })
        
        const response = await restOperation.response
        const result = await response.body.json() as unknown as CreateDynamodbQueryResponse
        
        if (!result.success) {
          throw new Error(result.error || 'Manual query failed')
        }

        // Immediately execute the created execution for manual queries
        if (result.data?.execution_id) {
          const executeOperation = post({
            apiName: 'zeiro-api',
            path: '/executions/execute',
            options: {
              body: { execution_id: result.data.execution_id }
            }
          })

          const executeResponse = await executeOperation.response
          const executeJson = await executeResponse.body.json() as unknown as { success: boolean; error?: string }

          if (!executeJson.success) {
            throw new Error(executeJson.error || 'Failed to execute query')
          }
        }
        
        return result
      } catch (error) {
        console.error('Manual query error:', error)
        throw error instanceof Error ? error : new Error('Manual query failed')
      }
    }
  })
}

// Helper function to build common filter conditions
export const buildFilter = {
  equals: (field: string, value: any): FilterCondition => ({
    field,
    operator: 'equals',
    value
  }),
  
  contains: (field: string, value: string): FilterCondition => ({
    field,
    operator: 'contains',
    value
  }),
  
  beginsWith: (field: string, value: string): FilterCondition => ({
    field,
    operator: 'begins_with',
    value
  }),
  
  between: (field: string, min: any, max: any): FilterCondition => ({
    field,
    operator: 'between',
    values: [min, max]
  }),
  
  in: (field: string, values: any[]): FilterCondition => ({
    field,
    operator: 'in',
    values
  }),
  
  exists: (field: string): FilterCondition => ({
    field,
    operator: 'exists'
  }),
  
  greaterThan: (field: string, value: any): FilterCondition => ({
    field,
    operator: 'greater_than',
    value
  }),
  
  lessThan: (field: string, value: any): FilterCondition => ({
    field,
    operator: 'less_than',
    value
  })
}

// Helper function to build scan parameters
export const buildScanQuery = (
  databaseId: string,
  tableName: string,
  options: {
    filters?: FilterCondition[]
    projection?: string[]
    limit?: number
    indexName?: string
    operation?: 'scan' | 'query' // Allow overriding operation
  } = {}
): ManualQueryParams => ({
  database_id: databaseId,
  operation: options.operation || 'scan',
  table_name: tableName,
  filters: options.filters,
  projection: options.projection,
  limit: options.limit,
  index_name: options.indexName
})

// Helper function to build query parameters
export const buildQuery = (
  databaseId: string,
  tableName: string,
  partitionKey: { name: string; value: any },
  options: {
    sortKey?: {
      name: string
      operator: 'equals' | 'begins_with' | 'between' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
      value?: any
      values?: any[]
    }
    filters?: FilterCondition[]
    projection?: string[]
    limit?: number
    indexName?: string
    consistentRead?: boolean
    scanIndexForward?: boolean
  } = {}
): ManualQueryParams => ({
  database_id: databaseId,
  operation: 'query',
  table_name: tableName,
  partition_key: partitionKey,
  ...options
})

// Helper function to build get-item parameters
export const buildGetItem = (
  databaseId: string,
  tableName: string,
  key: Record<string, any>,
  options: {
    projection?: string[]
    consistentRead?: boolean
  } = {}
): ManualQueryParams => ({
  database_id: databaseId,
  operation: 'get-item',
  table_name: tableName,
  key,
  ...options
})

// Legacy export for backward compatibility  
export const useManualQuery = useCreateDynamodbQuery; 