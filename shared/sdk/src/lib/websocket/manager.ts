import { webSocketConnections } from '@zeiro/domain'
import { getWebSocketClient } from './client'
import type { WebSocketMessage } from '../../types/websocket'

interface WebSocketConnection {
  connection_id: string
  user_id: string
  database_id?: string
  status: string
}

interface PublishResult {
  successful: number
  failed: number
  totalConnections: number
  errors: Array<{ connectionId: string; error: string }>
}

/**
 * WebSocketManager - Efficient WebSocket connection management
 * Fetches connections once and allows multiple publishes without re-fetching
 */
export class WebSocketManager {
  private connections: WebSocketConnection[] = []
  private wsClient: ReturnType<typeof getWebSocketClient>
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.wsClient = getWebSocketClient()
  }

  /**
   * Fetch active WebSocket connections for the user
   * This should be called once at the beginning of the Lambda execution
   */
  async fetchActiveConnections(): Promise<void> {
    console.log(`📡 Fetching websocket connections for user: ${this.userId}`)

    try {
      // Use primary index to fetch all connections for user (assume all are active since we delete disconnected ones)
      const connections = await webSocketConnections.query.primary({
        user_id: this.userId,
      }).go()

      this.connections = connections.data

      console.log(`🔍 Found ${this.connections.length} connections for user ${this.userId} using primary index`)
    } catch (error) {
      console.error('❌ Error fetching websocket connections:', error)
      this.connections = []
    }
  }

  /**
   * Publish a message to all fetched connections
   * This can be called multiple times without re-fetching connections
   */
  async publishToConnections(message: WebSocketMessage, options: { failSilently?: boolean } = {}): Promise<PublishResult> {
    const { failSilently = true } = options

    if (this.connections.length === 0) {
      return {
        successful: 0,
        failed: 0,
        totalConnections: 0,
        errors: []
      }
    }

    try {
      // Send to all connections
      const results = await this.wsClient.sendToConnections(
        this.connections.map(conn => conn.connection_id),
        message,
        { failSilently }
      )

      // Remove failed connections from local array (no DB cleanup needed since disconnect handler deletes them)
      if (results.failed.length > 0) {
        const failedConnectionIds = results.failed.map(f => f.connectionId)
        this.connections = this.connections.filter(c => !failedConnectionIds.includes(c.connection_id))
        console.log(`🗑️ Removed ${results.failed.length} failed connections from local cache`)
      }

      const result: PublishResult = {
        successful: results.successful.length,
        failed: results.failed.length,
        totalConnections: this.connections.length,
        errors: results.failed
      }

      console.log(`✅ WebSocket message published: ${result.successful} successful, ${result.failed} failed`)
      
      return result

    } catch (error) {
      console.error('❌ Error publishing to websocket connections:', error)
      
      if (!failSilently) {
        throw error
      }

      return {
        successful: 0,
        failed: this.connections.length,
        totalConnections: this.connections.length,
        errors: [{
          connectionId: 'all',
          error: error instanceof Error ? error.message : String(error)
        }]
      }
    }
  }

  /**
   * Publish a chat-specific message to all connections
   */
  async publishChatUpdate(
    chatType: 'chat_started' | 'chat_chunk' | 'chat_complete' | 'chat_error' | 'tool_call_started' | 'tool_call_completed' | 'tool_call_failed' | 'data_visualization',
    payload: any,
    options: {
      threadId?: string
      executionId?: string
      failSilently?: boolean
    } = {}
  ): Promise<PublishResult> {
    const message: WebSocketMessage = {
      type: chatType as any,
      timestamp: new Date().toISOString(),
      payload,
      executionId: options.executionId,
      metadata: {
        threadId: options.threadId
      }
    }

    return this.publishToConnections(message, {
      failSilently: options.failSilently
    })
  }

  /**
   * Get the number of active connections
   */
  getConnectionCount(): number {
    return this.connections.length
  }

  /**
   * Check if there are any active connections
   */
  hasActiveConnections(): boolean {
    return this.connections.length > 0
  }

}
