import { Model } from 'dynamodb-onetable'
import { websocketConnectionsTable } from './table'
import type { WebSocketConnection, WebSocketConnectionStatus, ConnectionFilter } from '../../types'

const WebSocketConnectionModel = new Model<WebSocketConnection>(
  websocketConnectionsTable,
  'WebSocketConnection'
)

export class WebSocketConnectionService {
  /**
   * Store a new WebSocket connection
   */
  async storeConnection(data: Omit<WebSocketConnection, 'createdAt' | 'expiresAt'>): Promise<void> {
    const now = new Date()
    const createdAt = now.toISOString()
    const expiresAt = Math.floor((now.getTime() + (24 * 60 * 60 * 1000)) / 1000) // 24 hours from now

    const connection: WebSocketConnection = {
      ...data,
      createdAt,
      expiresAt,
      status: data.status || 'connected',
    }

    await WebSocketConnectionModel.create(connection as never)
    console.log(`✅ Stored WebSocket connection: ${data.connectionId} for user: ${data.userId}`)
  }

  /**
   * Remove a WebSocket connection
   */
  async removeConnection(connectionId: string): Promise<void> {
    try {
      const connections = await WebSocketConnectionModel.find({
        pk: `CONNECTION#${connectionId}`,
      })

      if (connections.length > 0) {
        const connection = connections[0] as WebSocketConnection
        await WebSocketConnectionModel.update(
          { pk: connection.pk, sk: connection.sk },
          { status: 'disconnected' }
        )
        console.log(`✅ Marked connection as disconnected: ${connectionId}`)
      }
    } catch (error) {
      console.error('Error removing WebSocket connection:', error)
      throw error
    }
  }

  /**
   * Get a specific WebSocket connection
   */
  async getConnection(connectionId: string): Promise<WebSocketConnection | null> {
    try {
      const connections = await WebSocketConnectionModel.find({
        pk: `CONNECTION#${connectionId}`,
      })
      return connections.length > 0 ? connections[0] as WebSocketConnection : null
    } catch (error) {
      console.error('Error getting WebSocket connection:', error)
      throw error
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(connectionId: string, status: WebSocketConnectionStatus): Promise<void> {
    try {
      const connections = await WebSocketConnectionModel.find({
        pk: `CONNECTION#${connectionId}`,
      })

      if (connections.length > 0) {
        const connection = connections[0] as WebSocketConnection
        await WebSocketConnectionModel.update(
          { pk: connection.pk, sk: connection.sk },
          { status, lastSeenAt: new Date().toISOString() }
        )
        console.log(`✅ Updated connection status: ${connectionId} -> ${status}`)
      }
    } catch (error) {
      console.error('Error updating connection status:', error)
      throw error
    }
  }

  /**
   * Get all connections for a specific user
   */
  async getUserConnections(userId: string): Promise<WebSocketConnection[]> {
    try {
      console.log(`🔍 Querying connections for user: ${userId}`)
      console.log(`📋 Query parameters: gsi1pk=USER#${userId}, status=connected`)
      
      const connections = await WebSocketConnectionModel.find(
        { gsi1pk: `USER#${userId}` },
        {
          index: 'gsi1',
          where: '${status} = {connected}',
          substitutions: { connected: 'connected' },
        }
      )
      
      console.log(`📊 Query result: found ${connections.length} connections`)
      connections.forEach((conn, index) => {
        console.log(`🔗 Connection ${index + 1}:`, {
          connectionId: (conn as WebSocketConnection).connectionId,
          userId: (conn as WebSocketConnection).userId,
          status: (conn as WebSocketConnection).status,
          createdAt: (conn as WebSocketConnection).createdAt
        })
      })
      
      return connections as WebSocketConnection[]
    } catch (error) {
      console.error('Error getting user WebSocket connections:', error)
      throw error
    }
  }

  /**
   * Get all connections for a specific database
   */
  async getDatabaseConnections(databaseId: string): Promise<WebSocketConnection[]> {
    try {
      const connections = await WebSocketConnectionModel.scan({
        where: '${databaseId} = {databaseId} AND ${status} = {connected}',
        substitutions: { databaseId, connected: 'connected' },
      })
      return connections as WebSocketConnection[]
    } catch (error) {
      console.error('Error getting database WebSocket connections:', error)
      throw error
    }
  }

  /**
   * Get all active connections
   */
  async getActiveConnections(): Promise<WebSocketConnection[]> {
    try {
      const connections = await WebSocketConnectionModel.scan({
        where: '${status} = {connected}',
        substitutions: { connected: 'connected' },
      })
      return connections as WebSocketConnection[]
    } catch (error) {
      console.error('Error getting active WebSocket connections:', error)
      throw error
    }
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(connectionId: string, timestamp = new Date().toISOString()): Promise<void> {
    try {
      const connections = await WebSocketConnectionModel.find({
        pk: `CONNECTION#${connectionId}`,
      })

      if (connections.length > 0) {
        const connection = connections[0] as WebSocketConnection
        await WebSocketConnectionModel.update(
          { pk: connection.pk, sk: connection.sk },
          { lastSeenAt: timestamp }
        )
      }
    } catch (error) {
      console.error('Error updating last seen:', error)
      // Don't throw - this is not critical
    }
  }

  /**
   * Clean up stale and expired connections
   */
  async cleanupStaleConnections(): Promise<number> {
    try {
      const now = Math.floor(Date.now() / 1000)
      const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      
      // Find expired connections
      const expiredConnections = await WebSocketConnectionModel.scan({
        where: '${expiresAt} < {now} OR (${lastSeenAt} < {staleThreshold} AND ${status} = {connected})',
        substitutions: { now, staleThreshold, connected: 'connected' },
      })

      let cleanedCount = 0
      for (const connection of expiredConnections as WebSocketConnection[]) {
        await WebSocketConnectionModel.update(
          { pk: connection.pk, sk: connection.sk },
          { status: 'stale' }
        )
        cleanedCount++
      }

      console.log(`✅ Cleaned up ${cleanedCount} stale connections`)
      return cleanedCount
    } catch (error) {
      console.error('Error cleaning up stale connections:', error)
      return 0
    }
  }

  /**
   * Get connection count for a user
   */
  async getUserConnectionCount(userId: string): Promise<number> {
    const connections = await this.getUserConnections(userId)
    return connections.length
  }

  /**
   * Check if user has active connections
   */
  async hasActiveConnections(userId: string): Promise<boolean> {
    const count = await this.getUserConnectionCount(userId)
    return count > 0
  }
}
