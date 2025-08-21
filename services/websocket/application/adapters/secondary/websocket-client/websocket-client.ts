import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  GetConnectionCommand,
  DeleteConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { configureEnviromentVariables } from '@zeiro/sdk'
import type { WebSocketMessage } from '../../types'

const { REGION, STAGE } = configureEnviromentVariables()

export class WebSocketClient {
  private client: ApiGatewayManagementApiClient | null = null
  private ssmClient: SSMClient
  private endpoint: string | null = null

  constructor() {
    this.ssmClient = new SSMClient({
      region: REGION || 'eu-central-1',
      credentials: fromNodeProviderChain(),
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
      this.endpoint = await this.getWebSocketEndpoint()
      
      // Convert WebSocket URL to management endpoint
      const managementEndpoint = this.endpoint.replace('wss://', 'https://')

      this.client = new ApiGatewayManagementApiClient({
        endpoint: managementEndpoint,
        region: REGION || 'eu-central-1',
        credentials: fromNodeProviderChain(),
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
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      })

      await this.client.send(command)
      console.log(`✅ Sent message to connection ${connectionId}`)
    } catch (error: any) {
      if (error.name === 'GoneException' || error.$metadata?.httpStatusCode === 410) {
        console.log(`🧹 Connection ${connectionId} is no longer available`)
        throw new Error(`Connection ${connectionId} is no longer available`)
      }
      if (error.name === 'ForbiddenException' || error.$metadata?.httpStatusCode === 403) {
        console.error(`🔒 Access forbidden for connection ${connectionId}`)
        throw new Error(`Access forbidden for connection ${connectionId}`)
      }
      console.error(`❌ Failed to send message to ${connectionId}:`, error)
      throw error
    }
  }

  /**
   * Send messages to multiple connections
   */
  async sendToConnections(
    connectionIds: string[],
    message: WebSocketMessage
  ): Promise<{ successful: string[]; failed: Array<{ connectionId: string; error: string }> }> {
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
      return false
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
      console.log(`✅ Disconnected connection ${connectionId}`)
    } catch (error: any) {
      if (error.name === 'GoneException' || error.$metadata?.httpStatusCode === 410) {
        // Connection already gone
        return
      }
      console.error(`❌ Failed to disconnect ${connectionId}:`, error)
      throw error
    }
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
}
