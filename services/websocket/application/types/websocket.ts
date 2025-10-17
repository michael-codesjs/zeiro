import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

/**
 * WebSocket connection states
 */
export type WebSocketConnectionStatus = 'connected' | 'disconnected' | 'stale'

/**
 * WebSocket route types for API Gateway V2
 */
export type WebSocketRouteKey = '$connect' | '$disconnect' | '$default' | 'send-message' | 'broadcast'

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 
  | 'query.started'
  | 'query.progress' 
  | 'query.completed'
  | 'query.error'
  | 'chat.message'
  | 'chat.typing'
  | 'system.notification'
  | 'connection.ping'
  | 'connection.pong'

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<TPayload = any> {
  type: WebSocketMessageType
  timestamp: string
  executionId?: string
  payload: TPayload
  metadata?: Record<string, any>
}

/**
 * WebSocket event from API Gateway V2
 */
export interface WebSocketEvent extends Omit<APIGatewayProxyEvent, 'httpMethod' | 'path' | 'body'> {
  requestContext: APIGatewayProxyEvent['requestContext'] & {
    connectionId: string
    routeKey: WebSocketRouteKey
    eventType: 'CONNECT' | 'MESSAGE' | 'DISCONNECT'
    connectedAt?: number
    messageDirection?: 'IN' | 'OUT'
    messageId?: string
    stage: string
    apiId: string
  }
  body?: string
  isBase64Encoded?: boolean
}

/**
 * Parsed WebSocket message from client
 */
export interface ParsedWebSocketMessage {
  action: string
  type?: WebSocketMessageType
  target?: {
    userId?: string
    databaseId?: string
    connectionId?: string
  }
  message: WebSocketMessage
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  target: {
    userId?: string
    databaseId?: string
    connectionId?: string
  }
  message: WebSocketMessage
}

/**
 * Broadcast message request
 */
export interface BroadcastRequest {
  message: WebSocketMessage
  filters?: {
    userIds?: string[]
    databaseIds?: string[]
    excludeConnectionIds?: string[]
  }
}

/**
 * Connection filter criteria
 */
export interface ConnectionFilter {
  userId?: string
  databaseId?: string
  status?: WebSocketConnectionStatus
  metadata?: Record<string, any>
}

/**
 * WebSocket response
 */
export interface WebSocketResponse extends APIGatewayProxyResult {
  statusCode: 200 | 400 | 403 | 500
}

/**
 * Authentication context from JWT
 */
export interface AuthContext {
  userId: string
  sub: string
  username?: string
  email?: string
  [key: string]: any
}
