import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { QueryExecutionService } from '../../secondary/one-table'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { v4 as uuidv4 } from 'uuid'

interface CognitoContext {
  sub: string
  email: string
  username?: string
}

interface ExecuteQueryInput {
  execution_id: string
}

interface ExecuteQueryResponse {
  success: boolean
  data?: {
    execution_id: string
    status: 'queued'
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

function createSuccessResponse(data: ExecuteQueryResponse): APIGatewayProxyResult {
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

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Execute query handler received event:', JSON.stringify(event, null, 2))

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

    console.log('Request body:', event.body)

    let input: ExecuteQueryInput
    try {
      input = JSON.parse(event.body)
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (error) {
      console.log('ERROR: JSON parsing failed:', error)
      return createErrorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!input.execution_id) {
      console.log('ERROR: Missing execution_id field')
      return createErrorResponse(400, 'execution_id is required')
    }

    // Initialize query execution service
    const queryExecutionService = new QueryExecutionService()

    // Get the stored query execution by execution ID
    console.log('Fetching query execution for execution_id:', input.execution_id, 'user:', userContext.sub)
    const queryExecution = await queryExecutionService.getQueryExecutionByExecutionId(input.execution_id)
    
    if (!queryExecution) {
      console.log('ERROR: Query execution not found for execution_id:', input.execution_id)
      return createErrorResponse(404, 'Execution not found')
    }

    // Verify the execution belongs to the authenticated user
    if (queryExecution.userId !== userContext.sub) {
      console.log('ERROR: Execution does not belong to user:', userContext.sub)
      return createErrorResponse(403, 'Access denied to this execution')
    }

    // Verify execution is in pending_approval status (can only execute queries awaiting approval)
    if (queryExecution.status !== 'pending_approval') {
      console.log('ERROR: Execution not in pending_approval status:', queryExecution.status)
      return createErrorResponse(400, `Execution cannot be started. Current status: ${queryExecution.status}`)
    }

    const executionId = input.execution_id
    console.log('Using execution ID:', executionId)

    // Send message to SQS for async processing
    const queueUrl = process.env.QUERY_EXECUTION_QUEUE_URL
    if (!queueUrl) {
      throw new Error('QUERY_EXECUTION_QUEUE_URL environment variable not set')
    }

    const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'eu-central-1' })
    const sqsMessage = {
      executionId,
      userId: userContext.sub,
      databaseId: queryExecution.databaseId,
      query: queryExecution.naturalLanguageQuery,
      parameters: queryExecution.generatedParameters,
      operation: queryExecution.operation,
      threadId: queryExecution.threadId
    }

    console.log('Sending message to SQS queue:', queueUrl)
    console.log('SQS message:', JSON.stringify(sqsMessage, null, 2))

    await sqsClient.send(new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(sqsMessage),
      MessageAttributes: {
        'executionId': {
          DataType: 'String',
          StringValue: executionId
        },
        'userId': {
          DataType: 'String',
          StringValue: userContext.sub
        },
        'operation': {
          DataType: 'String',
          StringValue: queryExecution.operation || 'unknown'
        }
      }
    }))

    console.log('Query execution queued successfully with execution ID:', executionId)

    // Update execution status to queued
    await queryExecutionService.updateQueryExecutionStatus(
      userContext.sub, 
      executionId, 
      'queued'
    )

    const response: ExecuteQueryResponse = {
      success: true,
      data: {
        execution_id: executionId,
        status: 'queued',
        message: 'Query execution queued successfully'
      }
    }

    console.log('Returning response:', JSON.stringify(response, null, 2))
    return createSuccessResponse(response)

  } catch (error) {
    console.error('Execute query handler error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return createErrorResponse(500, errorMessage)
  }
} 