import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

/**
 * WebSocket connection states
 */
export type WebSocketConnectionStatus = 'connected' | 'disconnected' | 'stale'

/**
 * WebSocket route types for API Gateway V2
 */
export type WebSocketRouteKey = '$connect' | '$disconnect' | '$default' | string

/**
 * WebSocket message types for internal communication
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
 * Base WebSocket message structure
 */
export interface WebSocketMessage<TPayload = any> {
  type: WebSocketMessageType
  timestamp: string
  executionId?: string
  payload: TPayload
  metadata?: Record<string, any>
}

/**
 * WebSocket connection information
 */
export interface WebSocketConnection {
  connectionId: string
  userId: string
  databaseId?: string
  status: WebSocketConnectionStatus
  createdAt: string
  lastSeenAt?: string
  expiresAt: number
  metadata?: Record<string, any>
}

/**
 * WebSocket event from API Gateway V2
 */
export interface WebSocketEvent extends Omit<APIGatewayProxyEvent, 'httpMethod' | 'path' | 'body' | 'isBase64Encoded'> {
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
 * WebSocket response for API Gateway V2
 */
export interface WebSocketResponse extends APIGatewayProxyResult {
  statusCode: 200 | 403 | 500
}

/**
 * WebSocket client configuration
 */
export interface WebSocketClientConfig {
  endpoint?: string
  region?: string
  credentials?: any
  retryConfig?: {
    maxRetries?: number
    retryDelayMs?: number
  }
}

/**
 * WebSocket message broadcasting options
 */
export interface BroadcastOptions {
  excludeConnectionIds?: string[]
  filterByUserId?: string
  filterByDatabaseId?: string
  filterByMetadata?: Record<string, any>
}

/**
 * WebSocket connection filter criteria
 */
export interface ConnectionFilter {
  userId?: string
  databaseId?: string
  status?: WebSocketConnectionStatus
  metadata?: Record<string, any>
}

/**
 * WebSocket service operations interface
 */
export interface WebSocketService {
  // Connection management
  storeConnection(connection: Omit<WebSocketConnection, 'createdAt' | 'expiresAt'>): Promise<void>
  removeConnection(connectionId: string): Promise<void>
  getConnection(connectionId: string): Promise<WebSocketConnection | null>
  updateConnectionStatus(connectionId: string, status: WebSocketConnectionStatus): Promise<void>
  
  // Connection querying
  getUserConnections(userId: string): Promise<WebSocketConnection[]>
  getDatabaseConnections(databaseId: string): Promise<WebSocketConnection[]>
  getConnectionsByFilter(filter: ConnectionFilter): Promise<WebSocketConnection[]>
  
  // Message sending
  sendToConnection(connectionId: string, message: WebSocketMessage): Promise<void>
  sendToUser(userId: string, message: WebSocketMessage): Promise<void>
  sendToDatabase(databaseId: string, message: WebSocketMessage): Promise<void>
  broadcast(message: WebSocketMessage, options?: BroadcastOptions): Promise<void>
  
  // Health and cleanup
  ping(connectionId: string): Promise<boolean>
  cleanupStaleConnections(): Promise<number>
}

/**
 * WebSocket middleware context
 */
export interface WebSocketContext {
  connectionId: string
  userId?: string
  databaseId?: string
  routeKey: WebSocketRouteKey
  eventType: 'CONNECT' | 'MESSAGE' | 'DISCONNECT'
  stage: string
  apiId: string
  isAuthenticated: boolean
  claims?: Record<string, any>
}

/**
 * WebSocket handler function type
 */
export type WebSocketHandler<TEvent = WebSocketEvent> = (
  event: TEvent,
  context: WebSocketContext
) => Promise<WebSocketResponse>

/**
 * WebSocket middleware function type
 */
export type WebSocketMiddleware<TEvent = WebSocketEvent> = (
  event: TEvent,
  context: WebSocketContext,
  next: () => Promise<WebSocketResponse>
) => Promise<WebSocketResponse>
