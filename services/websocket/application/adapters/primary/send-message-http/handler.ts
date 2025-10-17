import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import { WebSocketClient } from '../../secondary/websocket-client'
import type { SendMessageRequest } from '../../../types'

const connectionService = new WebSocketConnectionService()
const webSocketClient = new WebSocketClient()

/**
 * HTTP endpoint to send WebSocket messages from other services
 */
const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('📤 HTTP send-message request:', JSON.stringify(event, null, 2))

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      }
    }

    const request: SendMessageRequest = JSON.parse(event.body)
    
    if (!request.target || !request.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Target and message are required' }),
      }
    }

    const { target, message } = request

    // Send based on target type
    if (target.connectionId) {
      // Send to specific connection
      await webSocketClient.sendToConnection(target.connectionId, message)
      console.log(`✅ Sent message to connection: ${target.connectionId}`)
    } else if (target.userId) {
      // Send to all connections for a user
      console.log(`🔍 Looking for connections for user: ${target.userId}`)
      const userConnections = await connectionService.getUserConnections(target.userId)
      console.log(`📊 Found ${userConnections.length} connections for user ${target.userId}:`, userConnections.map(c => ({
        connectionId: c.connection_id,
        status: c.status,
        createdAt: c.created_at
      })))
      
      const activeConnections = userConnections.filter(conn => conn.status === 'connected')
      console.log(`✅ Active connections after filtering: ${activeConnections.length}`)
      
      if (activeConnections.length === 0) {
        console.log(`❌ No active connections found for user ${target.userId}`)
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `No active connections for database: ${target.databaseId}` }),
        }
      }

      const results = await webSocketClient.sendToConnections(
        activeConnections.map(conn => conn.connectionId),
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid target specified' }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Message sent successfully' }),
    }
  } catch (error) {
    console.error('❌ Error sending message via HTTP:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
