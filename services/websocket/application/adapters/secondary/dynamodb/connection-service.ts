import { webSocketConnections, users } from '@zeiro/domain'
import type { WebSocketConnectionStatus, ConnectionFilter } from '../../../types'

export class WebSocketConnectionService {
  /**
   * Store a new WebSocket connection
   */
  async storeConnection(data: {
    connectionId: string
    userId: string
    workspaceId: string
    status?: WebSocketConnectionStatus
    metadata?: Record<string, any>
  }): Promise<void> {
    const now = new Date()
    const expiresAt = Math.floor((now.getTime() + (24 * 60 * 60 * 1000)) / 1000) // 24 hours from now

    // Prepare the connection object, only including defined values
    const connectionData: any = {
      connection_id: data.connectionId,
      user_id: data.userId,
      workspace_id: data.workspaceId,
      status: data.status || 'connected',
      expires_at: expiresAt,
    }

    if (data.metadata) {
      connectionData.metadata = data.metadata
    }

    await webSocketConnections.create(connectionData).go()

    console.log(`✅ Stored WebSocket connection: ${data.connectionId} for user: ${data.userId}`)
  }

  /**
   * Remove a WebSocket connection
   */
  async removeConnection(connectionId: string): Promise<void> {
    try {
      const connections = await webSocketConnections.query.byConnection({
        connection_id: connectionId,
      }).go()

      if (connections.data.length > 0) {
        const connection = connections.data[0]
        await webSocketConnections.delete({
          user_id: connection.user_id,
          connection_id: connection.connection_id,
        }).go()
        
        console.log(`✅ Deleted WebSocket connection: ${connectionId}`)
      }
    } catch (error) {
      console.error('Error removing WebSocket connection:', error)
      throw error
    }
  }

  /**
   * Get a specific WebSocket connection
   */
  async getConnection(connectionId: string): Promise<any | null> {
    try {
      const connections = await webSocketConnections.query.byConnection({
        connection_id: connectionId,
      }).go()
      
      return connections.data.length > 0 ? connections.data[0] : null
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
      const connections = await webSocketConnections.query.byConnection({
        connection_id: connectionId,
      }).go()

      if (connections.data.length > 0) {
        const connection = connections.data[0]
        await webSocketConnections.patch({
          user_id: connection.user_id,
          connection_id: connection.connection_id,
        }).set({
          status,
          last_seen_at: new Date().toISOString(),
        }).go()
        
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
  async getUserConnections(userId: string): Promise<any[]> {
    try {
      console.log(`🔍 Querying connections for user: ${userId}`)
      
      // Use primary index since PK is now user_id
      const connections = await webSocketConnections.query.primary({
        user_id: userId,
      }).where(({ status }, { eq }) => eq(status, 'connected')).go()
      
      console.log(`📊 Query result: found ${connections.data.length} connections`)
      connections.data.forEach((conn, index) => {
        console.log(`🔗 Connection ${index + 1}:`, {
          connectionId: conn.connection_id,
          userId: conn.user_id,
          status: conn.status,
          createdAt: conn.created_at
        })
      })
      
      return connections.data
    } catch (error) {
      console.error('Error getting user WebSocket connections:', error)
      throw error
    }
  }


  /**
   * Get all connections for a workspace
   */
  async getWorkspaceConnections(workspaceId: string, status: WebSocketConnectionStatus = 'connected'): Promise<any[]> {
    try {
      const connections = await webSocketConnections.query.byWorkspace({
        workspace_id: workspaceId,
      }).where(({ status: connStatus }, { eq }) => eq(connStatus, status)).go()
      
      return connections.data
    } catch (error) {
      console.error('Error getting workspace WebSocket connections:', error)
      throw error
    }
  }

  /**
   * Get all active connections
   */
  async getActiveConnections(): Promise<any[]> {
    try {
      // Use scan to get all active connections across all workspaces
      const connections = await webSocketConnections.scan
        .where(({ status }, { eq }) => eq(status, 'connected'))
        .go()
      
      return connections.data
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
      const connections = await webSocketConnections.query.byConnection({
        connection_id: connectionId,
      }).go()

      if (connections.data.length > 0) {
        const connection = connections.data[0]
        await webSocketConnections.patch({
          user_id: connection.user_id,
          connection_id: connection.connection_id,
        }).set({
          last_seen_at: timestamp,
        }).go()
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
      
      // Find expired connections using scan
      const expiredConnections = await webSocketConnections.scan
        .where(
          ({ expires_at, last_seen_at, status }, { lt, and, eq }) => 
            and([
              lt(expires_at, now),
              // OR condition for stale connections
              and([
                last_seen_at ? lt(last_seen_at, staleThreshold) : eq(status, 'connected'),
                eq(status, 'connected')
              ])
            ])
        )
        .go()

      let cleanedCount = 0
      for (const connection of expiredConnections.data) {
        await webSocketConnections.patch({
          user_id: connection.user_id,
          connection_id: connection.connection_id,
        }).set({
          status: 'stale',
        }).go()
        
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