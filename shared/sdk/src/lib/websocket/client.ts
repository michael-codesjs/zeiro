import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  GetConnectionCommand,
  DeleteConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { configureEnviromentVariables } from '../../utilities/functions/miscellanous'
import type {
  WebSocketClientConfig,
  WebSocketMessage,
  WebSocketConnection,
  BroadcastOptions,
  ConnectionFilter,
  WebSocketService,
  WebSocketConnectionStatus,
} from '../../types/websocket'

const { REGION, STAGE } = configureEnviromentVariables()

/**
 * WebSocket client for managing API Gateway V2 WebSocket connections
 */
export class WebSocketClient implements Partial<WebSocketService> {
  private client: ApiGatewayManagementApiClient | null = null
  private ssmClient: SSMClient
  private endpoint: string | null = null
  private readonly config: WebSocketClientConfig

  constructor(config: WebSocketClientConfig = {}) {
    this.config = {
      region: REGION || 'eu-central-1',
      credentials: fromNodeProviderChain(),
      retryConfig: {
        maxRetries: 3,
        retryDelayMs: 1000,
      },
      ...config,
    }

    this.ssmClient = new SSMClient({
      region: this.config.region,
      credentials: this.config.credentials,
    })
  }

  /**
   * Initialize the client with WebSocket endpoint
   */
  private async initialize(): Promise<void> {
    if (this.client && this.endpoint) {
      return
    }

    try {
      // Get endpoint from config or SSM
      if (this.config.endpoint) {
        this.endpoint = this.config.endpoint
      } else {
        this.endpoint = await this.getWebSocketEndpoint()
      }

      // Convert WebSocket URL to management endpoint
      const managementEndpoint = this.endpoint.replace('wss://', 'https://')

      this.client = new ApiGatewayManagementApiClient({
        endpoint: managementEndpoint,
        region: this.config.region,
        credentials: this.config.credentials,
      })
    } catch (error) {
      throw new Error(
        `Failed to initialize WebSocket client: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Get WebSocket endpoint from SSM Parameter Store
   */
  private async getWebSocketEndpoint(): Promise<string> {
    const parameterName = `/zeiro/${STAGE || 'dev'}/infrastructure/io/central/websocket/api/stage-url`

    try {
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true,
      })

      const response = await this.ssmClient.send(command)

      if (!response.Parameter?.Value) {
        throw new Error(`WebSocket endpoint parameter ${parameterName} not found or empty`)
      }

      return response.Parameter.Value
    } catch (error) {
      throw new Error(
        `Failed to get WebSocket endpoint from SSM: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Send a message to a specific WebSocket connection
   */
  async sendToConnection(connectionId: string, message: WebSocketMessage): Promise<void> {
    await this.initialize()

    if (!this.client) {
      throw new Error('WebSocket client not initialized')
    }

    try {
      // First check if connection is valid
      await this.validateConnection(connectionId)

      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      })

      await this.client.send(command)
    } catch (error: any) {
      if (error.name === 'GoneException' || error.$metadata?.httpStatusCode === 410) {
        throw new Error(`Connection ${connectionId} is no longer available`)
      }
      if (error.name === 'ForbiddenException' || error.$metadata?.httpStatusCode === 403) {
        throw new Error(`Access forbidden for connection ${connectionId}`)
      }
      throw new Error(
        `Failed to send message to connection ${connectionId}: ${error.message || String(error)}`
      )
    }
  }

  /**
   * Send a message to multiple connections with retry logic
   */
  async sendToConnections(
    connectionIds: string[],
    message: WebSocketMessage,
    options: { failSilently?: boolean } = {}
  ): Promise<{ successful: string[]; failed: Array<{ connectionId: string; error: string }> }> {
    await this.initialize()

    const results = {
      successful: [] as string[],
      failed: [] as Array<{ connectionId: string; error: string }>,
    }

    const sendPromises = connectionIds.map(async (connectionId) => {
      try {
        await this.sendToConnection(connectionId, message)
        results.successful.push(connectionId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.failed.push({ connectionId, error: errorMessage })

        if (!options.failSilently) {
          console.warn(`Failed to send message to connection ${connectionId}:`, errorMessage)
        }
      }
    })

    await Promise.allSettled(sendPromises)
    return results
  }

  /**
   * Validate if a connection is still active
   */
  async validateConnection(connectionId: string): Promise<boolean> {
    await this.initialize()

    if (!this.client) {
      throw new Error('WebSocket client not initialized')
    }

    try {
      const command = new GetConnectionCommand({
        ConnectionId: connectionId,
      })

      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'GoneException' || error.$metadata?.httpStatusCode === 410) {
        return false
      }
      throw error
    }
  }

  /**
   * Disconnect a WebSocket connection
   */
  async disconnectConnection(connectionId: string): Promise<void> {
    await this.initialize()

    if (!this.client) {
      throw new Error('WebSocket client not initialized')
    }

    try {
      const command = new DeleteConnectionCommand({
        ConnectionId: connectionId,
      })

      await this.client.send(command)
    } catch (error: any) {
      if (error.name === 'GoneException' || error.$metadata?.httpStatusCode === 410) {
        // Connection already gone, consider it successful
        return
      }
      throw new Error(
        `Failed to disconnect connection ${connectionId}: ${error.message || String(error)}`
      )
    }
  }

  /**
   * Send a ping message to test connection
   */
  async ping(connectionId: string): Promise<boolean> {
    try {
      const pingMessage: WebSocketMessage = {
        type: 'connection.ping',
        timestamp: new Date().toISOString(),
        payload: { timestamp: Date.now() },
      }

      await this.sendToConnection(connectionId, pingMessage)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get the current WebSocket endpoint URL
   */
  async getEndpoint(): Promise<string> {
    if (!this.endpoint) {
      await this.initialize()
    }
    return this.endpoint!
  }

  /**
   * Get client configuration
   */
  getConfig(): WebSocketClientConfig {
    return { ...this.config }
  }

  /**
   * Create a message with proper structure
   */
  createMessage<TPayload = any>(
    type: WebSocketMessage['type'],
    payload: TPayload,
    options: {
      executionId?: string
      metadata?: Record<string, any>
    } = {}
  ): WebSocketMessage<TPayload> {
    return {
      type,
      timestamp: new Date().toISOString(),
      payload,
      ...options,
    }
  }

  /**
   * Batch send messages with concurrency control
   */
  async batchSend(
    sends: Array<{ connectionId: string; message: WebSocketMessage }>,
    options: {
      concurrency?: number
      failSilently?: boolean
    } = {}
  ): Promise<{ successful: number; failed: number; errors: Array<{ connectionId: string; error: string }> }> {
    const { concurrency = 10, failSilently = true } = options
    const errors: Array<{ connectionId: string; error: string }> = []
    let successful = 0
    let failed = 0

    // Process in batches to control concurrency
    for (let i = 0; i < sends.length; i += concurrency) {
      const batch = sends.slice(i, i + concurrency)

      const batchPromises = batch.map(async ({ connectionId, message }) => {
        try {
          await this.sendToConnection(connectionId, message)
          successful++
        } catch (error) {
          failed++
          const errorMessage = error instanceof Error ? error.message : String(error)
          errors.push({ connectionId, error: errorMessage })

          if (!failSilently) {
            console.warn(`Batch send failed for connection ${connectionId}:`, errorMessage)
          }
        }
      })

      await Promise.allSettled(batchPromises)
    }

    return { successful, failed, errors }
  }
}

/**
 * Create a singleton WebSocket client instance
 */
let defaultClient: WebSocketClient | null = null

export function getWebSocketClient(config?: WebSocketClientConfig): WebSocketClient {
  if (!defaultClient) {
    defaultClient = new WebSocketClient(config)
  }
  return defaultClient
}

/**
 * Reset the singleton client (useful for testing)
 */
export function resetWebSocketClient(): void {
  defaultClient = null
}
