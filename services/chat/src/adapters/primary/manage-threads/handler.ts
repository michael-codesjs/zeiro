import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Zeiro } from '@zeiro/agents'
import { IntegrationService } from '../../secondary/integration/services'
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

interface CognitoContext {
  sub: string
  email: string
  username?: string
}
interface ThreadManagementInput {
  action: 'create' | 'list' | 'get' | 'delete' | 'update'
  thread_id?: string
  database_id: string // Required for all operations to maintain database-scoped conversations
  title?: string // For create and update operations
  metadata?: Record<string, unknown> // For create and update operations
}

interface ThreadManagementResponse {
  success: boolean
  data?: {
    thread_id?: string
    threads?: any[]
    thread?: any
    message?: string
  }
  error?: string
}

function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
  try {
    const claims = event.requestContext.authorizer?.claims
    if (!claims) {
      console.log('No claims found in request context')
      return null
    }

    return {
      sub: claims.sub,
      email: claims.email,
      username: claims.preferred_username || claims.username
    }
  } catch (error) {
    console.error('Error extracting Cognito context:', error)
    return null
  }
}

function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  }
}

function createSuccessResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
    },
    body: JSON.stringify(data)
  }
}

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Thread management handler received event:', JSON.stringify(event, null, 2))

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

    let input: ThreadManagementInput
    try {
      input = JSON.parse(event.body)
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (error) {
      console.log('ERROR: JSON parsing failed:', error)
      return createErrorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!input.action) {
      return createErrorResponse(400, 'action is required')
    }

    if (!input.database_id) {
      return createErrorResponse(400, 'database_id is required for all thread operations')
    }

    // Initialize integration service and get database details
    const integrationService = new IntegrationService()
    const { database, credentials, schema } = await integrationService.getDatabaseWithCredentials(
      input.database_id,
      userContext.sub
    )

    // Determine model to use
    const modelProvider = process.env.QUERY_AGENT_MODEL || 'gpt-4o-mini'
    let model
    if (modelProvider.startsWith('claude')) {
      model = anthropic(modelProvider)
    } else {
      model = openai(modelProvider)
    }

    // Create data source agent using factory
    const agent = AgentFactory.createAgent({
      dataSourceType: 'dynamodb', // TODO: Determine from database.type
      data_source: {
        id: input.database_id,
        name: database.name,
        table_name: schema.table_name
      },
      credentials: {
        access_key_id: credentials.accessKeyId,
        secret_access_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken
      },
      model,
      region: credentials.region,
      user_id: userContext.sub
    })

    // Get memory from the DynamoDB agent
    const memory = (agent as any).memory

    if (!memory) {
      return createErrorResponse(500, 'Memory not available for thread operations')
    }

    let response: ThreadManagementResponse

    switch (input.action) {
      case 'create':
        const threadOptions: any = {
          resourceId: input.database_id
        }

        if (input.title) {
          threadOptions.title = input.title
        }

        threadOptions.metadata = {
          database_id: input.database_id,
          table_name: schema.table_name,
          createdAt: new Date().toISOString(),
          ...input.metadata
        }

        const thread = await memory.createThread(threadOptions)

        response = {
          success: true,
          data: {
            thread_id: thread.id,
            message: 'Thread created successfully'
          }
        }
        break

      case 'list':
        const threads = await memory.getThreadsByResourceId({ resourceId: input.database_id })

        // Transform threads to match expected format
        const transformedThreads = threads.map(thread => ({
          id: thread.id,
          title: thread.title || 'Untitled Conversation',
          created_at: thread.createdAt,
          updated_at: thread.updatedAt,
          database_id: thread.metadata?.database_id || input.database_id,
          table_name: thread.metadata?.table_name,
          metadata: thread.metadata || {},
          message_count: 0 // Not available from thread object
        }))

        response = {
          success: true,
          data: {
            threads: transformedThreads,
            message: `Found ${transformedThreads.length} threads`
          }
        }
        break

      case 'get':
        if (!input.thread_id) {
          return createErrorResponse(400, 'thread_id is required for getting thread details')
        }

        const threadData = await memory.getThreadById({ threadId: input.thread_id })

        // Transform thread to match expected format
        const transformedThread = {
          ...threadData,
          title: threadData.title || 'Untitled Conversation',
          metadata: threadData.metadata || {},
          database_id: threadData.metadata?.database_id || input.database_id,
          table_name: threadData.metadata?.table_name
        }

        response = {
          success: true,
          data: {
            thread: transformedThread,
            message: 'Thread retrieved successfully'
          }
        }
        break

      case 'update':
        if (!input.thread_id) {
          return createErrorResponse(400, 'thread_id is required for updating thread')
        }

        if (!input.title) {
          return createErrorResponse(400, 'title is required for updating thread')
        }

        // Update the thread title using memory
        await memory.updateThread({
          threadId: input.thread_id,
          title: input.title
        })

        response = {
          success: true,
          data: {
            thread_id: input.thread_id,
            message: 'Thread title updated successfully'
          }
        }
        break

      case 'delete':
        if (!input.thread_id) {
          return createErrorResponse(400, 'thread_id is required for deleting thread')
        }

        // Delete the thread using memory
        await memory.deleteThread({ threadId: input.thread_id })

        response = {
          success: true,
          data: {
            thread_id: input.thread_id,
            message: 'Thread deleted successfully'
          }
        }
        break

      default:
        return createErrorResponse(400, `Unsupported action: ${input.action}`)
    }

    return createSuccessResponse(response)

  } catch (error) {
    console.error('Thread management handler error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    if (errorMessage.includes('Database not found')) {
      return createErrorResponse(404, 'Database not found')
    }
    
    if (errorMessage.includes('Unauthorized access')) {
      return createErrorResponse(403, 'Unauthorized access to database')
    }
    
    return createErrorResponse(500, `Internal server error: ${errorMessage}`)
  }
} 