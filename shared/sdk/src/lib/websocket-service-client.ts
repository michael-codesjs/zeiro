import { apiGatewaySignedFetch } from './api-gw-signed-fetcher'
import { configureEnviromentVariables } from '../utilities/functions/miscellanous'
import type { WebSocketMessage } from '../types/websocket'

const { WEBSOCKET_SERVICE_URL } = configureEnviromentVariables()

/**
 * Client for interacting with the WebSocket service
 * Use this from other services to send messages via WebSocket
 */
export class WebSocketServiceClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || WEBSOCKET_SERVICE_URL || ''
    if (!this.baseUrl) {
      throw new Error('WebSocket service URL not configured. Set WEBSOCKET_SERVICE_URL environment variable.')
    }
  }

  /**
   * Send a message to a specific user
   */
  async sendToUser(userId: string, message: WebSocketMessage): Promise<void> {
    await this.sendMessage({
      target: { userId },
      message,
    })
  }

  /**
   * Send a message to all users connected to a database
   */
  async sendToDatabase(databaseId: string, message: WebSocketMessage): Promise<void> {
    await this.sendMessage({
      target: { databaseId },
      message,
    })
  }

  /**
   * Send a message to a specific connection
   */
  async sendToConnection(connectionId: string, message: WebSocketMessage): Promise<void> {
    await this.sendMessage({
      target: { connectionId },
      message,
    })
  }

  /**
   * Broadcast a message to all connections with optional filters
   */
  async broadcast(
    message: WebSocketMessage,
    filters?: {
      userIds?: string[]
      databaseIds?: string[]
      excludeConnectionIds?: string[]
    }
  ): Promise<void> {
    const response = await apiGatewaySignedFetch(`${this.baseUrl}/websocket/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        filters,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to broadcast message: ${error}`)
    }
  }

  /**
   * Send query execution updates
   */
  async sendQueryUpdate(
    executionId: string,
    type: 'query.started' | 'query.progress' | 'query.completed' | 'query.error',
    payload: any,
    options: { userId?: string; databaseId?: string } = {}
  ): Promise<void> {
    const message: WebSocketMessage = {
      type,
      timestamp: new Date().toISOString(),
      executionId,
      payload,
    }

    if (options.userId) {
      await this.sendToUser(options.userId, message)
    } else if (options.databaseId) {
      await this.sendToDatabase(options.databaseId, message)
    } else {
      await this.broadcast(message)
    }
  }

  /**
   * Send a notification to all users
   */
  async sendNotification(
    notification: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const message: WebSocketMessage = {
      type: 'system.notification',
      timestamp: new Date().toISOString(),
      payload: { message: notification },
      metadata,
    }

    await this.broadcast(message)
  }

  /**
   * Send a chat message
   */
  async sendChatMessage(
    userId: string,
    chatMessage: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const message: WebSocketMessage = {
      type: 'chat.message',
      timestamp: new Date().toISOString(),
      payload: { message: chatMessage },
      metadata,
    }

    await this.sendToUser(userId, message)
  }

  /**
   * Internal method to send message via HTTP API
   */
  private async sendMessage(data: {
    target: { userId?: string; databaseId?: string; connectionId?: string }
    message: WebSocketMessage
  }): Promise<void> {
    const response = await apiGatewaySignedFetch(`${this.baseUrl}/websocket/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send message: ${error}`)
    }
  }
}

/**
 * Create a singleton WebSocket service client
 */
let defaultServiceClient: WebSocketServiceClient | null = null

export function getWebSocketServiceClient(baseUrl?: string): WebSocketServiceClient {
  if (!defaultServiceClient) {
    defaultServiceClient = new WebSocketServiceClient(baseUrl)
  }
  return defaultServiceClient
}

/**
 * Reset the singleton client (useful for testing)
 */
export function resetWebSocketServiceClient(): void {
  defaultServiceClient = null
}
