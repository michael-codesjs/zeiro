import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import { users } from '@zeiro/domain'
import type { WebSocketEvent, AuthContext } from '../../../types'

const connectionService = new WebSocketConnectionService()

/**
 * Handle WebSocket connection events
 */
const handler = async (event: WebSocketEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔌 WebSocket connect event:', JSON.stringify(event, null, 2))

  const { connectionId } = event.requestContext

  try {
    // Extract auth context from query parameters or headers - REQUIRED
    const authContext = extractAuthContext(event)
    
    if (!authContext) {
      console.error('❌ Authentication required for WebSocket connection')
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Authentication required',
          message: 'Pass JWT token as query parameter: ?token=your-jwt-token'
        }),
      }
    }

    // Get user to find their workspace
    const user = await users.query.byCognitoUser({
      cognito_user_id: authContext.userId,
    }).go()

    if (!user.data.length) {
      console.error('❌ User not found for WebSocket connection')
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'User not found',
          message: 'Invalid user credentials'
        }),
      }
    }

    const userData = user.data[0]
    const workspaceId = userData.workspace_id
    const user_id = userData.id // Use the actual user ID from our system

    // Store the authenticated connection
    console.log(`💾 Storing connection: ${connectionId} for user: ${user_id} (cognito: ${authContext.userId}) in workspace: ${workspaceId}`)
    
    // Prepare connection data, filtering out undefined values
    const connectionData: any = {
      connectionId,
      userId: user_id, // Use actual user ID instead of Cognito ID
      workspaceId,
      status: 'connected',
      metadata: {
        connectedAt: Date.now(),
        authenticated: true,
        cognitoUserId: authContext.userId, // Store Cognito ID as metadata for reference
      },
    }
    
    if (event.headers?.['User-Agent']) {
      connectionData.metadata.userAgent = event.headers['User-Agent']
    }
    
    if (event.headers?.Origin) {
      connectionData.metadata.origin = event.headers.Origin
    }
    
    if (authContext.username) {
      connectionData.metadata.username = authContext.username
    }
    
    if (authContext.email) {
      connectionData.metadata.email = authContext.email
    }

    await connectionService.storeConnection(connectionData)

    console.log(`✅ WebSocket connected and stored: ${connectionId} for user: ${user_id}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Connected successfully',
        userId: user_id, // Return actual user ID
        workspaceId,
      }),
    }
  } catch (error) {
    console.error('❌ Error handling WebSocket connect:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to establish connection',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

/**
 * Extract authentication context from the event
 */
function extractAuthContext(event: WebSocketEvent): AuthContext | null {
  try {
    // Try to get from query parameters (token passed in URL)
    const token = event.queryStringParameters?.token

    if (token) {
      // Decode JWT token (simplified - in production, verify signature)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      
      return {
        userId: payload.sub || payload.userId,
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
      }
    }

    // Try to get from Authorization header
    const authHeader = event.headers?.Authorization || event.headers?.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const authToken = authHeader.substring(7)
      const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString())
      
      return {
        userId: payload.sub || payload.userId,
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting auth context:', error)
    return null
  }
}

export const main = handler
