import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getDataSourceWithCredentials } from '@zeiro/sdk'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { users } from '@zeiro/domain'

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'eu-central-1' })

interface CognitoContext {
  sub: string
  email: string
  username?: string
}

interface ChatRequest {
  message: string
  workspace_id: string
  data_source_id: string // Required for fetching datasource
  thread_id?: string
}

interface ChatResponse {
  success: boolean
  data?: {
    message: string
    executionId: string
    status: 'processing' | 'accepted'
  }
  error?: string
}

// Thread management is now handled within the Zeiro agent class

function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
  const claims = event.requestContext?.authorizer?.claims
  if (!claims) {
    return null
  }

  return {
    sub: claims.sub,
    email: claims.email,
    username: claims['cognito:username']
  }
}

function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
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
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify({
      success: true,
      data
    })
  }
}

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Chat handler received event:', JSON.stringify(event, null, 2))

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

    let input: ChatRequest
    try {
      input = JSON.parse(event.body)
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (error) {
      console.log('ERROR: JSON parsing failed:', error)
      return createErrorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!input.message) {
      console.log('ERROR: Missing message field')
      return createErrorResponse(400, 'message is required')
    }
    
    if (!input.workspace_id) {
      console.log('ERROR: Missing workspace_id field')
      return createErrorResponse(400, 'workspace_id is required')
    }

    if (!input.data_source_id) {
      console.log('ERROR: Missing data_source_id field')
      return createErrorResponse(400, 'data_source_id is required')
    }
    console.log('Fetching data source with credentials for data_source_id:', input.data_source_id)
    const dataSourceWithCredentials = await getDataSourceWithCredentials(input.data_source_id)
    
    if (!dataSourceWithCredentials) {
      return createErrorResponse(404, 'Data source not found')
    }

    console.log('Data source fetched successfully. Name:', dataSourceWithCredentials.name, 'Type:', dataSourceWithCredentials.type)

    // Look up actual user ID from Cognito user ID
    console.log('🔍 Looking up user by Cognito ID:', userContext.sub)
    const user = await users.query.byCognitoUser({
      cognito_user_id: userContext.sub,
    }).go()

    if (!user.data.length) {
      console.error('❌ User not found for Cognito ID:', userContext.sub)
      return createErrorResponse(404, 'User not found')
    }

    const userData = user.data[0]
    const actualUserId = userData.id
    console.log('✅ Found actual user ID:', actualUserId, 'for Cognito ID:', userContext.sub)

    // Generate execution ID for tracking this request
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated execution ID:', executionId)

    // Publish event to EventBridge for asynchronous processing
    console.log('Publishing USER_PROMPTED event to EventBridge')
    const putEventsCommand = new PutEventsCommand({
      Entries: [
        {
          Source: 'zeiro.chat',
          DetailType: 'USER_PROMPTED',
          Detail: JSON.stringify({
            executionId,
            userId: actualUserId, // Use actual user ID
            cognitoUserId: userContext.sub, // Keep Cognito ID for reference
            workspaceId: input.workspace_id,
            dataSourceId: input.data_source_id,
            message: input.message,
            threadId: input.thread_id,
            timestamp: new Date().toISOString(),
            userEmail: userContext.email,
            userName: userContext.username
          }),
          EventBusName: process.env.EVENT_BUS_NAME!
        }
      ]
    })

    try {
      const result = await eventBridge.send(putEventsCommand)
      console.log('Event published successfully:', result)

      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        console.error('Some events failed to publish:', result.Entries)
        return createErrorResponse(500, 'Failed to queue chat request for processing')
      }

      // Return immediate acknowledgment
      console.log('Chat request accepted and queued for processing')
      return createSuccessResponse({
        message: 'Chat request accepted and processing started',
        executionId,
        status: 'processing' as const
      })

    } catch (eventError) {
      console.error('Error publishing event to EventBridge:', eventError)
      return createErrorResponse(500, 'Failed to queue chat request for processing')
    }

  } catch (error) {
    console.error('Error in chat handler:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    if (errorMessage.includes('Data source') && errorMessage.includes('not found')) {
      return createErrorResponse(404, 'Data source not found')
    }
    
    if (errorMessage.includes('credential') && errorMessage.includes('decrypt')) {
      return createErrorResponse(403, 'Failed to decrypt data source credentials')
    }
    
    return createErrorResponse(500, `Internal server error: ${errorMessage}`)
  }
}
