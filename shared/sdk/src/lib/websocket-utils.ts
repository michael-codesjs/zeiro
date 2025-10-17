import { webSocketConnections } from '@zeiro/domain'
import { getWebSocketClient } from './websocket/client'
import type { WebSocketMessage } from '../types/websocket'

/**
 * Efficiently send updates to all active websockets for a user
 * @param userId - The user ID to send updates to
 * @param message - The websocket message to send
 * @param options - Additional options for sending
 * @returns Promise with results of the send operation
 */
export async function sendUpdateViaWebsocket(
  userId: string,
  message: WebSocketMessage,
  options: {
    databaseId?: string // Optional filter by database
    failSilently?: boolean // Whether to fail silently on errors
    maxRetries?: number // Maximum number of retries per connection
  } = {}
): Promise<{
  successful: number
  failed: number
  totalConnections: number
  errors: Array<{ connectionId: string; error: string }>
}> {
  const { databaseId, failSilently = true, maxRetries = 2 } = options

  try {
    console.log(`📡 Fetching active websocket connections for user: ${userId}`)

    // Build query for user connections
    let query = webSocketConnections.query.byUser({
      user_id: userId,
    }).where(({ status }, { eq }) => eq(status, 'connected'))

    // Add database filter if specified
    if (databaseId) {
      query = query.where(({ database_id }, { eq }) => eq(database_id, databaseId))
    }

    const connections = await query.go()
    const activeConnections = connections.data

    console.log(`🔍 Found ${activeConnections.length} active connections for user ${userId}`)

    if (activeConnections.length === 0) {
      return {
        successful: 0,
        failed: 0,
        totalConnections: 0,
        errors: []
      }
    }

    // Get websocket client
    const wsClient = getWebSocketClient()

    // Send to all connections with retry logic
    const results = await wsClient.sendToConnections(
      activeConnections.map(conn => conn.connection_id),
      message,
      { failSilently }
    )

    // Clean up any failed connections that are no longer available
    const staleConnections = results.failed.filter(failure => 
      failure.error.includes('no longer available') || 
      failure.error.includes('GoneException')
    )

    if (staleConnections.length > 0) {
      console.log(`🧹 Cleaning up ${staleConnections.length} stale connections`)
      
      // Mark stale connections as disconnected
      const cleanupPromises = staleConnections.map(async ({ connectionId }) => {
        try {
          const connection = activeConnections.find(c => c.connection_id === connectionId)
          if (connection) {
            await webSocketConnections.patch({
              connection_id: connection.connection_id,
              user_id: connection.user_id,
            }).set({
              status: 'disconnected',
              last_seen_at: new Date().toISOString(),
            }).go()
          }
        } catch (error) {
          console.warn(`Failed to cleanup stale connection ${connectionId}:`, error)
        }
      })

      await Promise.allSettled(cleanupPromises)
    }

    const result = {
      successful: results.successful.length,
      failed: results.failed.length,
      totalConnections: activeConnections.length,
      errors: results.failed
    }

    console.log(`✅ WebSocket update sent: ${result.successful} successful, ${result.failed} failed`)
    
    return result

  } catch (error) {
    console.error('❌ Error sending websocket update:', error)
    
    if (!failSilently) {
      throw error
    }

    return {
      successful: 0,
      failed: 1,
      totalConnections: 0,
      errors: [{
        connectionId: 'unknown',
        error: error instanceof Error ? error.message : String(error)
      }]
    }
  }
}

/**
 * Send updates to multiple users efficiently
 * @param userIds - Array of user IDs to send updates to
 * @param message - The websocket message to send
 * @param options - Additional options for sending
 * @returns Promise with aggregated results
 */
export async function sendUpdateViaWebsocketToUsers(
  userIds: string[],
  message: WebSocketMessage,
  options: {
    databaseId?: string
    failSilently?: boolean
    concurrency?: number // Number of users to process concurrently
  } = {}
): Promise<{
  successful: number
  failed: number
  totalConnections: number
  userResults: Array<{
    userId: string
    successful: number
    failed: number
    errors: Array<{ connectionId: string; error: string }>
  }>
}> {
  const { concurrency = 5, ...sendOptions } = options

  console.log(`📡 Sending websocket updates to ${userIds.length} users`)

  const userResults: Array<{
    userId: string
    successful: number
    failed: number
    errors: Array<{ connectionId: string; error: string }>
  }> = []

  let totalSuccessful = 0
  let totalFailed = 0
  let totalConnections = 0

  // Process users in batches to control concurrency
  for (let i = 0; i < userIds.length; i += concurrency) {
    const batch = userIds.slice(i, i + concurrency)

    const batchPromises = batch.map(async (userId) => {
      const result = await sendUpdateViaWebsocket(userId, message, sendOptions)
      
      userResults.push({
        userId,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors
      })

      totalSuccessful += result.successful
      totalFailed += result.failed
      totalConnections += result.totalConnections

      return result
    })

    await Promise.allSettled(batchPromises)
  }

  console.log(`✅ Bulk websocket update completed: ${totalSuccessful} successful, ${totalFailed} failed across ${totalConnections} connections`)

  return {
    successful: totalSuccessful,
    failed: totalFailed,
    totalConnections,
    userResults
  }
}

/**
 * Send chat-specific updates via websocket
 * @param userId - The user ID to send the chat update to
 * @param chatType - Type of chat message
 * @param payload - Chat message payload
 * @param options - Additional options
 */
export async function sendChatUpdateViaWebsocket(
  userId: string,
  chatType: 'chat_started' | 'chat_chunk' | 'chat_complete' | 'chat_error',
  payload: any,
  options: {
    threadId?: string
    executionId?: string
    databaseId?: string
    failSilently?: boolean
  } = {}
): Promise<{
  successful: number
  failed: number
  totalConnections: number
  errors: Array<{ connectionId: string; error: string }>
}> {
  const message: WebSocketMessage = {
    type: chatType as any, // Type assertion since chat types aren't in the base types yet
    timestamp: new Date().toISOString(),
    payload,
    executionId: options.executionId,
    metadata: {
      threadId: options.threadId,
      databaseId: options.databaseId
    }
  }

  return sendUpdateViaWebsocket(userId, message, {
    databaseId: options.databaseId,
    failSilently: options.failSilently
  })
}
