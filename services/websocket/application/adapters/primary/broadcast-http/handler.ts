import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import { WebSocketClient } from '../../secondary/websocket-client'
import type { BroadcastRequest } from '../../../types'

const connectionService = new WebSocketConnectionService()
const webSocketClient = new WebSocketClient()

/**
 * HTTP endpoint to broadcast WebSocket messages from other services
 */
const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('📡 HTTP broadcast request:', JSON.stringify(event, null, 2))

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

    const request: BroadcastRequest = JSON.parse(event.body)
    
    if (!request.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Message is required' }),
      }
    }

    const { message, filters } = request

    // Get all active connections
    let connections = await connectionService.getActiveConnections()

    // Apply filters if provided
    if (filters) {
      if (filters.userIds) {
        connections = connections.filter(conn => filters.userIds!.includes(conn.userId))
      }
      if (filters.databaseIds) {
        connections = connections.filter(conn => 
          conn.databaseId && filters.databaseIds!.includes(conn.databaseId)
        )
      }
      if (filters.excludeConnectionIds) {
        connections = connections.filter(conn => 
          !filters.excludeConnectionIds!.includes(conn.connectionId)
        )
      }
    }

    if (connections.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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

    console.log(`✅ HTTP Broadcast complete: ${results.successful.length} successful, ${results.failed.length} failed`)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        message: 'Broadcast completed',
        sent: results.successful.length,
        failed: results.failed.length,
        totalConnections: connections.length
      }),
    }
  } catch (error) {
    console.error('❌ Error broadcasting message via HTTP:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to broadcast message',
        details: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
