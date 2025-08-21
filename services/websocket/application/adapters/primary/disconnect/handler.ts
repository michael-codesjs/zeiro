import type { APIGatewayProxyResult } from 'aws-lambda'
import { WebSocketConnectionService } from '../../secondary/dynamodb'
import type { WebSocketEvent } from '../../../types'

const connectionService = new WebSocketConnectionService()

/**
 * Handle WebSocket disconnection events
 */
const handler = async (event: WebSocketEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔌 WebSocket disconnect event:', JSON.stringify(event, null, 2))

  const { connectionId } = event.requestContext

  try {
    // Mark the connection as disconnected
    await connectionService.removeConnection(connectionId)

    console.log(`✅ WebSocket disconnected: ${connectionId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected successfully' }),
    }
  } catch (error) {
    console.error('❌ Error handling WebSocket disconnect:', error)
    
    // Still return 200 - we don't want to fail disconnection
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Disconnected with cleanup error',
        error: error instanceof Error ? error.message : String(error)
      }),
    }
  }
}

export const main = handler
