import type { APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import type { WebSocketEvent } from '../../../types'

const connectionService = new WebSocketConnectionService()

/**
 * Handle default WebSocket route (catch-all)
 */
const handler = async (event: WebSocketEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔄 WebSocket default route event:', JSON.stringify(event, null, 2))

  const { connectionId, routeKey } = event.requestContext

  try {
    // Update last seen for any message
    await connectionService.updateLastSeen(connectionId)

    // Parse message if present
    let parsedBody = null
    if (event.body) {
      try {
        parsedBody = JSON.parse(event.body)
      } catch (parseError) {
        console.warn('Failed to parse message body:', parseError)
      }
    }

    console.log(`📝 Received message on route '${routeKey}' from ${connectionId}:`, parsedBody)

    // Note: Authentication is now required during connection, not post-connection

    // Handle ping message
    if (parsedBody?.type === 'connection.ping') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: 'connection.pong',
          timestamp: new Date().toISOString(),
          payload: { originalTimestamp: parsedBody.payload?.timestamp }
        }),
      }
    }

    // Handle subscription message
    if (parsedBody?.action === 'subscribe' && parsedBody?.execution_id) {
      console.log(`📡 Subscribing ${connectionId} to execution: ${parsedBody.execution_id}`)
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: 'subscription.success',
          execution_id: parsedBody.execution_id,
          message: 'Subscribed to execution updates'
        }),
      }
    }

    // For unhandled routes, return a helpful message
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Received message on route: ${routeKey}`,
        availableActions: ['subscribe', 'send-message', 'broadcast'],
        timestamp: new Date().toISOString()
      }),
    }
  } catch (error) {
    console.error('❌ Error handling default route:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
