import { webSocketConnections } from '@zeiro/domain'
import { getWebSocketClient } from './client'
import type { WebSocketMessage } from '../../types/websocket'

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
    failSilently?: boolean // Whether to fail silently on errors
    maxRetries?: number // Maximum number of retries per connection
  } = {}
): Promise<{
  successful: number
  failed: number
  totalConnections: number
  errors: Array<{ connectionId: string; error: string }>
}> {
  const { failSilently = true, maxRetries = 2 } = options

  try {
    console.log(`📡 Fetching active websocket connections for user: ${userId}`)

    // Build query for user connections using primary index (all assumed active since we delete disconnected ones)
    const connections = await webSocketConnections.query.primary({
      user_id: userId,
    }).go()

    const activeConnections = connections.data

    console.log(`🔍 Found ${activeConnections.length} connections for user ${userId}`)

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

    // Note: Stale connections are automatically cleaned up by the disconnect handler
    // No need to manually clean them up here since they get deleted from DB on disconnect

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
  chatType: 'chat_started' | 'chat_chunk' | 'chat_complete' | 'chat_error' | 'tool_call_started' | 'tool_call_completed' | 'tool_call_failed' | 'data_visualization',
  payload: any,
  options: {
    threadId?: string
    executionId?: string
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
      threadId: options.threadId
    }
  }

  return sendUpdateViaWebsocket(userId, message, {
    failSilently: options.failSilently
  })
}
