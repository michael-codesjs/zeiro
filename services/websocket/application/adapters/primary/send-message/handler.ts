import type { APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import { WebSocketClient } from '../../secondary/websocket-client'
import type { WebSocketEvent, SendMessageRequest, ParsedWebSocketMessage } from '../../../types'

const connectionService = new WebSocketConnectionService()
const webSocketClient = new WebSocketClient()

/**
 * Handle send message requests
 */
const handler = async (event: WebSocketEvent): Promise<APIGatewayProxyResult> => {
  console.log('📤 WebSocket send-message event:', JSON.stringify(event, null, 2))

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
    
    if (!parsedMessage.target || !parsedMessage.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Target and message are required' }),
      }
    }

    const { target, message } = parsedMessage

    // Update sender's last seen
    await connectionService.updateLastSeen(connectionId)

    // Send based on target type
    if (target.connectionId) {
      // Send to specific connection
      await webSocketClient.sendToConnection(target.connectionId, message)
      console.log(`✅ Sent message to connection: ${target.connectionId}`)
    } else if (target.userId) {
      // Send to all connections for a user
      const userConnections = await connectionService.getUserConnections(target.userId)
      const activeConnections = userConnections.filter(conn => conn.status === 'connected')
      
      if (activeConnections.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `No active connections for user: ${target.userId}` }),
        }
      }

      const results = await webSocketClient.sendToConnections(
        activeConnections.map(conn => conn.connection_id),
        message
      )

      // Clean up failed connections
      for (const failed of results.failed) {
        if (failed.error.includes('no longer available')) {
          await connectionService.removeConnection(failed.connectionId)
        }
      }

      console.log(`✅ Sent message to user ${target.userId}: ${results.successful.length} successful, ${results.failed.length} failed`)
    } else if (target.databaseId) {
      // Send to all connections for a database
      const dbConnections = await connectionService.getDatabaseConnections(target.databaseId)
      const activeConnections = dbConnections.filter(conn => conn.status === 'connected')
      
      if (activeConnections.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `No active connections for database: ${target.databaseId}` }),
        }
      }

      const results = await webSocketClient.sendToConnections(
        activeConnections.map(conn => conn.connection_id),
        message
      )

      // Clean up failed connections
      for (const failed of results.failed) {
        if (failed.error.includes('no longer available')) {
          await connectionService.removeConnection(failed.connectionId)
        }
      }

      console.log(`✅ Sent message to database ${target.databaseId}: ${results.successful.length} successful, ${results.failed.length} failed`)
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid target specified' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully' }),
    }
  } catch (error) {
    console.error('❌ Error sending message:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
