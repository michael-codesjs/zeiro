import type { APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import { WebSocketClient } from '../../secondary/websocket-client'
import type { WebSocketEvent, BroadcastRequest, ParsedWebSocketMessage } from '../../../types'

const connectionService = new WebSocketConnectionService()
const webSocketClient = new WebSocketClient()

/**
 * Handle broadcast message requests
 */
const handler = async (event: WebSocketEvent): Promise<APIGatewayProxyResult> => {
  console.log('📡 WebSocket broadcast event:', JSON.stringify(event, null, 2))

  const { connectionId } = event.requestContext

  try {
    // Parse the message body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message body is required' }),
      }
    }

    const parsedMessage: ParsedWebSocketMessage = JSON.parse(event.body)
    
    if (!parsedMessage.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      }
    }

    const { message } = parsedMessage

    // Update sender's last seen
    await connectionService.updateLastSeen(connectionId)

    // Get all active connections
    let connections = await connectionService.getActiveConnections()

    // Apply filters if provided
    const filters = (parsedMessage as any).filters
    if (filters) {
      if (filters.userIds) {
        connections = connections.filter(conn => filters.userIds.includes(conn.userId))
      }
      if (filters.databaseIds) {
        connections = connections.filter(conn => 
          conn.databaseId && filters.databaseIds.includes(conn.databaseId)
        )
      }
      if (filters.excludeConnectionIds) {
        connections = connections.filter(conn => 
          !filters.excludeConnectionIds.includes(conn.connectionId)
        )
      }
    }

    // Exclude sender's connection
    connections = connections.filter(conn => conn.connectionId !== connectionId)

    if (connections.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'No connections to broadcast to',
          sent: 0,
          failed: 0 
        }),
      }
    }

    // Send to all filtered connections
    const results = await webSocketClient.sendToConnections(
      connections.map(conn => conn.connectionId),
      message
    )

    // Clean up failed connections
    for (const failed of results.failed) {
      if (failed.error.includes('no longer available')) {
        await connectionService.removeConnection(failed.connectionId)
      }
    }

    console.log(`✅ Broadcast complete: ${results.successful.length} successful, ${results.failed.length} failed`)

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Broadcast completed',
        sent: results.successful.length,
        failed: results.failed.length,
        totalConnections: connections.length
      }),
    }
  } catch (error) {
    console.error('❌ Error broadcasting message:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to broadcast message',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
