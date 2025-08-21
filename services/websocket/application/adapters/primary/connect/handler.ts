import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
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

    // Extract database ID if provided
    const databaseId = event.queryStringParameters?.databaseId

    // Store the authenticated connection
    console.log(`💾 Storing connection: ${connectionId} for user: ${authContext.userId}`)
    await connectionService.storeConnection({
      connectionId,
      userId: authContext.userId,
      databaseId,
      status: 'connected',
      metadata: {
        userAgent: event.headers?.['User-Agent'],
        origin: event.headers?.Origin,
        connectedAt: Date.now(),
        authenticated: true,
        username: authContext.username,
        email: authContext.email,
      },
    })

    console.log(`✅ WebSocket connected and stored: ${connectionId} for user: ${authContext.userId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Connected successfully',
        userId: authContext.userId 
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
