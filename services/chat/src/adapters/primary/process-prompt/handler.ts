import { EventBridgeEvent } from 'aws-lambda'
import { Zeiro } from '@zeiro/agents'
import { getDataSourceWithCredentials } from '@zeiro/sdk'
import { WebSocketManager } from '@zeiro/sdk/src/lib/websocket/manager'
import { users } from '@zeiro/domain'

interface UserPromptedEvent {
  executionId: string
  userId: string // This is now the actual user ID
  cognitoUserId: string // Cognito user ID for reference
  workspaceId: string
  dataSourceId: string
  message: string
  threadId?: string
  timestamp: string
  userEmail?: string
  userName?: string
}

/**
 * Process user prompts asynchronously via EventBridge
 * This Lambda has a 15-minute timeout for long-running AI processing
 */
export const main = async (event: EventBridgeEvent<'USER_PROMPTED', UserPromptedEvent>) => {
  const { detail: promptData } = event
  
  console.log('🚀 Processing prompt:', {
    executionId: promptData.executionId,
    userId: promptData.userId, // This is now the actual user ID
    cognitoUserId: promptData.cognitoUserId,
    dataSourceId: promptData.dataSourceId,
    message: promptData.message.substring(0, 100) + '...'
  })
  
  let websocket: WebSocketManager | null = null
  
  try {
    // Initialize WebSocket manager for the user (already actual user ID)
    console.log('📡 Initializing WebSocket manager for user:', promptData.userId)
    websocket = new WebSocketManager(promptData.userId)
    await websocket.fetchActiveConnections()
    
    if (!websocket.hasActiveConnections()) {
      console.log('⚠️ No active WebSocket connections found, skipping processing')
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No active connections, processing skipped',
          executionId: promptData.executionId
        })
      }
    }
    
    console.log(`✅ Found ${websocket.getConnectionCount()} active WebSocket connections`)
    
    // Send processing started event
    await websocket.publishChatUpdate('chat_started', {
      message: 'Processing your request...',
      executionId: promptData.executionId,
      thread_id: promptData.threadId
    }, {
      threadId: promptData.threadId,
      executionId: promptData.executionId
    })
    
    // Get data source with credentials
    console.log('🔐 Fetching data source with credentials:', promptData.dataSourceId)
    const dataSourceWithCredentials = await getDataSourceWithCredentials(promptData.dataSourceId)
    console.log('✅ Data source fetched:', dataSourceWithCredentials.name)
    
    // Create Zeiro agent instance with WebSocket manager for tool streaming
    console.log('🤖 Creating Zeiro agent instance')
    const zeiro = new Zeiro({
      user_id: promptData.userId, // Already the actual user ID
      dataSource: dataSourceWithCredentials,
      websocketManager: websocket // Pass WebSocket manager for tool call streaming
    })
    
    // Start streaming the AI response
    console.log('🎯 Starting AI stream for message:', promptData.message)
    const { stream, threadId } = await zeiro.streamLegacy([
      {
        role: 'user',
        content: promptData.message
      }
    ], { 
      threadId: promptData.threadId,
      executionId: promptData.executionId // Pass executionId for tool streaming
    })
    
    let fullResponse = ''
    let chunkCount = 0
    
    // Stream chunks in real-time via WebSocket
    console.log('📡 Starting real-time streaming via WebSocket')
    for await (const chunk of stream.textStream) {
      chunkCount++
      console.log(`📝 Streaming chunk ${chunkCount}:`, chunk.substring(0, 50) + '...')
      
      fullResponse += chunk
      
      // Send chunk to all active WebSocket connections
      await websocket.publishChatUpdate('chat_chunk', {
        chunk,
        full_response: fullResponse,
        thread_id: threadId,
        executionId: promptData.executionId,
        chunk_number: chunkCount
      }, {
        threadId,
        executionId: promptData.executionId
      })
    }
    
    // Send completion message
    console.log('✅ AI streaming completed, sending completion message')
    await websocket.publishChatUpdate('chat_complete', {
      message: fullResponse,
      thread_id: threadId,
      executionId: promptData.executionId,
      finished: true,
      total_chunks: chunkCount
    }, {
      threadId,
      executionId: promptData.executionId
    })
    
    console.log('🎉 Prompt processing completed successfully:', {
      executionId: promptData.executionId,
      threadId,
      totalChunks: chunkCount,
      responseLength: fullResponse.length
    })
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        executionId: promptData.executionId,
        threadId,
        totalChunks: chunkCount,
        responseLength: fullResponse.length
      })
    }
    
  } catch (error) {
    console.error('❌ Error processing prompt:', error)
    
    // Send error via WebSocket if possible
    if (websocket && websocket.hasActiveConnections()) {
      try {
        await websocket.publishChatUpdate('chat_error', {
          error: 'Failed to process your request',
          details: error instanceof Error ? error.message : String(error),
          executionId: promptData.executionId
        }, {
          executionId: promptData.executionId
        })
        console.log('📡 Error message sent via WebSocket')
      } catch (wsError) {
        console.error('❌ Failed to send error via WebSocket:', wsError)
      }
    } else {
      // Try to create a new WebSocket manager for error reporting
      try {
        const errorWebsocket = new WebSocketManager(promptData.userId)
        await errorWebsocket.fetchActiveConnections()
        
        if (errorWebsocket.hasActiveConnections()) {
          await errorWebsocket.publishChatUpdate('chat_error', {
            error: 'Failed to process your request',
            details: error instanceof Error ? error.message : String(error),
            executionId: promptData.executionId
          }, {
            executionId: promptData.executionId
          })
        }
      } catch (fallbackError) {
        console.error('❌ Failed to send error via fallback WebSocket:', fallbackError)
      }
    }
    
    // Re-throw error to trigger Lambda retry/DLQ if configured
    throw error
  }
}
