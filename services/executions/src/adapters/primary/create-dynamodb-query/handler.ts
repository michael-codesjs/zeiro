import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { QueryExecutionService } from '../../secondary/one-table'
import { IntegrationService } from '../../secondary/integration/services'
import { v4 as uuidv4 } from 'uuid'

interface CognitoContext {
  sub: string
  email: string
  username?: string
}

interface FilterCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'begins_with' | 'between' | 'exists' | 'not_exists' | 'in' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
  value?: any
  values?: any[] // For 'in' and 'between' operators
}

interface CreateDynamodbQueryInput {
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

interface CreateDynamodbQueryResponse {
  success: boolean
  data?: {
    execution_id: string
    status: 'pending_approval'
    operation: string
    message: string
  }
  error?: string
}

function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
  const claims = event.requestContext.authorizer?.claims
  if (!claims?.sub) {
    return null
  }

  return {
    sub: claims.sub,
    email: claims.email || '',
    username: claims['cognito:username']
  }
}

function createSuccessResponse(data: CreateDynamodbQueryResponse): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent'
    },
    body: JSON.stringify(data)
  }
}

function createErrorResponse(statusCode: number, errorMessage: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent'
    },
    body: JSON.stringify({
      success: false,
      error: errorMessage
    })
  }
}

function transformToAwsParameters(input: CreateDynamodbQueryInput, actualTableName: string): any {
  const baseParams: any = {
    TableName: actualTableName
  }

  // Add pagination
  if (input.limit) {
    baseParams.Limit = input.limit
  }

  if (input.exclusive_start_key) {
    baseParams.ExclusiveStartKey = input.exclusive_start_key
  }

  // Add consistent read
  if (input.consistent_read) {
    baseParams.ConsistentRead = input.consistent_read
  }

  // Add projection expression
  if (input.projection && input.projection.length > 0) {
    baseParams.ProjectionExpression = input.projection.join(', ')
  }

  // Add index name
  if (input.index_name) {
    baseParams.IndexName = input.index_name
  }

  switch (input.operation) {
    case 'scan': {
      // Build filter expression for scan
      if (input.filters && input.filters.length > 0) {
        const { filterExpression, expressionAttributeNames, expressionAttributeValues } = buildFilterExpression(input.filters)
        baseParams.FilterExpression = filterExpression
        if (Object.keys(expressionAttributeNames).length > 0) {
          baseParams.ExpressionAttributeNames = expressionAttributeNames
        }
        if (Object.keys(expressionAttributeValues).length > 0) {
          baseParams.ExpressionAttributeValues = expressionAttributeValues
        }
      }
      return baseParams
    }

    case 'query': {
      // Build key condition expression
      if (input.partition_key) {
        let keyCondition = `#pk = :pk`
        const expressionAttributeNames: Record<string, string> = { '#pk': input.partition_key.name }
        const expressionAttributeValues: Record<string, any> = { ':pk': input.partition_key.value }

        // Add sort key condition if provided
        if (input.sort_key) {
          const sortKeyPlaceholder = ':sk'
          expressionAttributeNames['#sk'] = input.sort_key.name

          switch (input.sort_key.operator) {
            case 'equals':
              keyCondition += ` AND #sk = ${sortKeyPlaceholder}`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
            case 'begins_with':
              keyCondition += ` AND begins_with(#sk, ${sortKeyPlaceholder})`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
            case 'between':
              keyCondition += ` AND #sk BETWEEN ${sortKeyPlaceholder}1 AND ${sortKeyPlaceholder}2`
              expressionAttributeValues[`${sortKeyPlaceholder}1`] = input.sort_key.values?.[0]
              expressionAttributeValues[`${sortKeyPlaceholder}2`] = input.sort_key.values?.[1]
              break
            case 'greater_than':
              keyCondition += ` AND #sk > ${sortKeyPlaceholder}`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
            case 'less_than':
              keyCondition += ` AND #sk < ${sortKeyPlaceholder}`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
            case 'greater_equal':
              keyCondition += ` AND #sk >= ${sortKeyPlaceholder}`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
            case 'less_equal':
              keyCondition += ` AND #sk <= ${sortKeyPlaceholder}`
              expressionAttributeValues[sortKeyPlaceholder] = input.sort_key.value
              break
          }
        }

        baseParams.KeyConditionExpression = keyCondition
        baseParams.ExpressionAttributeNames = expressionAttributeNames
        baseParams.ExpressionAttributeValues = expressionAttributeValues

        // Add filter expression if provided
        if (input.filters && input.filters.length > 0) {
          const { filterExpression, expressionAttributeNames: filterNames, expressionAttributeValues: filterValues } = buildFilterExpression(input.filters, Object.keys(expressionAttributeNames).length, Object.keys(expressionAttributeValues).length)
          baseParams.FilterExpression = filterExpression
          baseParams.ExpressionAttributeNames = { ...baseParams.ExpressionAttributeNames, ...filterNames }
          baseParams.ExpressionAttributeValues = { ...baseParams.ExpressionAttributeValues, ...filterValues }
        }

        // Add scan index forward
        if (input.scan_index_forward !== undefined) {
          baseParams.ScanIndexForward = input.scan_index_forward
        }
      }
      return baseParams
    }

    case 'get-item': {
      if (input.key) {
        baseParams.Key = input.key
      }
      return baseParams
    }

    case 'batch-get': {
      if (input.keys && input.keys.length > 0) {
        return {
          RequestItems: {
            [actualTableName]: {
              Keys: input.keys,
              ...(input.projection && { ProjectionExpression: input.projection.join(', ') }),
              ...(input.consistent_read && { ConsistentRead: input.consistent_read })
            }
          }
        }
      }
      return baseParams
    }

    default:
      return baseParams
  }
}

function buildFilterExpression(filters: FilterCondition[], nameOffset: number = 0, valueOffset: number = 0): {
  filterExpression: string
  expressionAttributeNames: Record<string, string>
  expressionAttributeValues: Record<string, any>
} {
  const expressions: string[] = []
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, any> = {}

  filters.forEach((filter, index) => {
    const nameKey = `#f${nameOffset + index}`
    const valueKey = `:f${valueOffset + index}`

    expressionAttributeNames[nameKey] = filter.field

    switch (filter.operator) {
      case 'equals':
        expressions.push(`${nameKey} = ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'not_equals':
        expressions.push(`${nameKey} <> ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'contains':
        expressions.push(`contains(${nameKey}, ${valueKey})`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'not_contains':
        expressions.push(`NOT contains(${nameKey}, ${valueKey})`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'begins_with':
        expressions.push(`begins_with(${nameKey}, ${valueKey})`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'between':
        expressions.push(`${nameKey} BETWEEN ${valueKey}1 AND ${valueKey}2`)
        expressionAttributeValues[`${valueKey}1`] = filter.values?.[0]
        expressionAttributeValues[`${valueKey}2`] = filter.values?.[1]
        break
      case 'exists':
        expressions.push(`attribute_exists(${nameKey})`)
        break
      case 'not_exists':
        expressions.push(`attribute_not_exists(${nameKey})`)
        break
      case 'in':
        const inValues = filter.values?.map((_, i) => `${valueKey}_${i}`) || []
        expressions.push(`${nameKey} IN (${inValues.join(', ')})`)
        filter.values?.forEach((value, i) => {
          expressionAttributeValues[`${valueKey}_${i}`] = value
        })
        break
      case 'greater_than':
        expressions.push(`${nameKey} > ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'less_than':
        expressions.push(`${nameKey} < ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'greater_equal':
        expressions.push(`${nameKey} >= ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
      case 'less_equal':
        expressions.push(`${nameKey} <= ${valueKey}`)
        expressionAttributeValues[valueKey] = filter.value
        break
    }
  })

  return {
    filterExpression: expressions.join(' AND '),
    expressionAttributeNames,
    expressionAttributeValues
  }
}

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Create DynamoDB query handler received event:', JSON.stringify(event, null, 2))

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent'
      },
      body: ''
    }
  }

  try {
    // Validate authentication
    const userContext = getCognitoContext(event)
    if (!userContext) {
      return createErrorResponse(401, 'Unauthorized')
    }

    // Parse and validate request body
    if (!event.body) {
      console.log('ERROR: No request body provided')
      return createErrorResponse(400, 'Request body is required')
    }

    let input: CreateDynamodbQueryInput
    try {
      input = JSON.parse(event.body)
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (error) {
      console.log('ERROR: JSON parsing failed:', error)
      return createErrorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!input.database_id) {
      return createErrorResponse(400, 'database_id is required')
    }
    if (!input.operation) {
      return createErrorResponse(400, 'operation is required')
    }
    if (!input.table_name) {
      return createErrorResponse(400, 'table_name is required')
    }

    // Get database and its credentials using IntegrationService
    console.log('Fetching database with credentials for database_id:', input.database_id, 'user:', userContext.sub)
    const integrationService = new IntegrationService()
    
    let databaseWithCredentials
    try {
      databaseWithCredentials = await integrationService.getDatabaseWithCredentials(input.database_id, userContext.sub)
    } catch (error) {
      console.error('Failed to get database with credentials:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve database or credentials'
      return createErrorResponse(400, errorMessage)
    }

    const { database, credentials, schema } = databaseWithCredentials
    const actualTableName = database.connection_config.table
    console.log('Database fetched successfully. Database name:', database.name, 'Actual table name:', actualTableName, 'Region:', credentials.region)

    // Validate credentials exist and are accessible (but don't execute yet)
    console.log('Credentials validated successfully for database:', database.name)

    // Transform form input into AWS SDK DynamoDB parameters using the actual table name from connection config
    const awsParams = transformToAwsParameters(input, actualTableName)
    console.log('Generated AWS SDK parameters with actual table name:', JSON.stringify(awsParams, null, 2))

    // Initialize query execution service
    const queryExecutionService = new QueryExecutionService()

    const executionId = uuidv4() // Create an execution ID for this manual query

    console.log('Generated execution ID:', executionId)

      // Create the query execution record with pending_approval status
      await queryExecutionService.createQueryExecution({
        userId: userContext.sub,
        executionId: executionId,
        databaseId: input.database_id,
        naturalLanguageQuery: `Manual ${input.operation} query on ${input.table_name}`, // Keep display name for description
        generatedParameters: awsParams, // Store AWS SDK formatted parameters
        operation: input.operation,
        status: 'pending_approval', // Set to pending_approval as requested
        autoApproved: false
      })

      console.log('Query execution created successfully:', {
        executionId,
        operation: input.operation,
        status: 'pending_approval',
        database: database.name,
        displayTableName: input.table_name,
        actualTableName: actualTableName
      })

      const response: CreateDynamodbQueryResponse = {
        success: true,
        data: {
          execution_id: executionId,
          status: 'pending_approval',
          operation: input.operation,
          message: 'DynamoDB query created successfully. Use the execution_id to execute it.'
        }
      }

      return createSuccessResponse(response)

  } catch (error) {
    console.error('Create DynamoDB query handler error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return createErrorResponse(500, errorMessage)
  }
}
