"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { post, get } from 'aws-amplify/api';
import { useSelectedDataSourceStore } from "./use-selected-data-source-store";

export interface ToolCall {
  id: string;
  tool_id: string;
  tool_name: string;
  description?: string;
  input?: any;
  result?: any;
  error?: string;
  status: 'started' | 'completed' | 'failed';
  timestamp: Date;
}

export interface DataVisualization {
  id: string;
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'scatter_plot';
  data: {
    columns: Array<{
      key: string;
      label: string;
      type: 'string' | 'number' | 'date' | 'boolean';
      format?: string;
    }>;
    rows: Record<string, any>[];
  };
  config: any;
  query?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  visualizations?: DataVisualization[];
  metadata?: {
    sources?: string[];
    reasoning?: string;
    confidence?: number;
    thread_id?: string;
  };
}

export interface ChatOptions {
  deepSearch?: boolean;
  reasoning?: boolean;
  attachments?: File[];
}

interface UseChatProps {
  initialMessages?: ChatMessage[];
  onError?: (error: Error) => void;
}

export function useChat({ initialMessages = [], onError }: UseChatProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [threadId, setThreadId] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const { selectedDataSource } = useSelectedDataSourceStore();

  // Listen for WebSocket messages
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!wsUrl) return;

    let ws: WebSocket;

    const connect = async () => {
      try {
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) return;

        ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'chat_started':
                setIsStreaming(true);
                break;
                
              case 'chat_chunk':
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.isStreaming) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: message.payload.full_response,
                      }
                    ];
                  } else {
                    return [
                      ...prev,
                      {
                        id: `assistant-${Date.now()}`,
                        content: message.payload.full_response,
                        role: 'assistant' as const,
                        timestamp: new Date(),
                        isStreaming: true,
                        metadata: {
                          thread_id: message.payload.thread_id
                        }
                      }
                    ];
                  }
                });
                break;
                
              case 'chat_complete':
                setIsStreaming(false);
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.isStreaming) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: message.payload.message,
                        isStreaming: false,
                        metadata: {
                          ...lastMessage.metadata,
                          thread_id: message.payload.thread_id
                        }
                      }
                    ];
                  }
                  return prev;
                });
                setThreadId(message.payload.thread_id);
                break;
                
              case 'chat_error':
                setIsStreaming(false);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `error-${Date.now()}`,
                    content: `Error: ${message.payload.error}`,
                    role: 'assistant' as const,
                    timestamp: new Date(),
                  }
                ]);
                break;

              case 'tool_call_started':
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant' && (lastMessage.isStreaming || !lastMessage.content)) {
                    // Add tool call to existing assistant message
                    const newToolCall: ToolCall = {
                      id: `tool-${Date.now()}`,
                      tool_id: message.payload.tool_id,
                      tool_name: message.payload.tool_name,
                      description: message.payload.description,
                      input: message.payload.input,
                      status: 'started',
                      timestamp: new Date(message.payload.timestamp)
                    };
                    
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        toolCalls: [...(lastMessage.toolCalls || []), newToolCall]
                      }
                    ];
                  } else {
                    // Create new assistant message with tool call
                    const newToolCall: ToolCall = {
                      id: `tool-${Date.now()}`,
                      tool_id: message.payload.tool_id,
                      tool_name: message.payload.tool_name,
                      description: message.payload.description,
                      input: message.payload.input,
                      status: 'started',
                      timestamp: new Date(message.payload.timestamp)
                    };
                    
                    return [
                      ...prev,
                      {
                        id: `assistant-${Date.now()}`,
                        content: '',
                        role: 'assistant' as const,
                        timestamp: new Date(),
                        isStreaming: true,
                        toolCalls: [newToolCall],
                        metadata: {
                          thread_id: message.metadata?.threadId
                        }
                      }
                    ];
                  }
                });
                break;

              case 'tool_call_completed':
              case 'tool_call_failed':
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.toolCalls) {
                    const updatedToolCalls = lastMessage.toolCalls.map(toolCall => {
                      if (toolCall.tool_id === message.payload.tool_id && toolCall.status === 'started') {
                        return {
                          ...toolCall,
                          status: message.type === 'tool_call_completed' ? 'completed' as const : 'failed' as const,
                          result: message.payload.result,
                          error: message.payload.error,
                          timestamp: new Date(message.payload.timestamp)
                        };
                      }
                      return toolCall;
                    });
                    
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        toolCalls: updatedToolCalls
                      }
                    ];
                  }
                  return prev;
                });
                break;

              case 'data_visualization':
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    // Add visualization to existing assistant message
                    const newVisualization: DataVisualization = {
                      id: message.payload.visualization.id,
                      type: message.payload.visualization.type,
                      data: message.payload.visualization.data,
                      config: message.payload.visualization.config,
                      query: message.payload.visualization.query,
                      timestamp: message.payload.visualization.timestamp
                    };
                    
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        visualizations: [...(lastMessage.visualizations || []), newVisualization]
                      }
                    ];
                  } else {
                    // Create new assistant message with visualization
                    const newVisualization: DataVisualization = {
                      id: message.payload.visualization.id,
                      type: message.payload.visualization.type,
                      data: message.payload.visualization.data,
                      config: message.payload.visualization.config,
                      query: message.payload.visualization.query,
                      timestamp: message.payload.visualization.timestamp
                    };
                    
                    return [
                      ...prev,
                      {
                        id: `assistant-${Date.now()}`,
                        content: '',
                        role: 'assistant' as const,
                        timestamp: new Date(),
                        visualizations: [newVisualization]
                      }
                    ];
                  }
                });
                break;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      options 
    }: { 
      message: string; 
      options?: ChatOptions 
    }) => {
      if (!selectedDataSource) {
        throw new Error('No data source selected');
      }

      // Get current user to fetch workspace_id
      const userOperation = get({
        apiName: 'zeiro-api',
        path: '/user/me',
      });
      const userResponse = await userOperation.response;
      const userData = await userResponse.body.json();

      const restOperation = post({
        apiName: 'zeiro-api',
        path: '/chat',
        options: {
          body: {
            message,
            workspace_id: userData.workspace_id,
            data_source_id: selectedDataSource.id,
            thread_id: threadId,
          },
        },
      });

      const response = await restOperation.response;
      
      if (response.statusCode !== 200) {
        throw new Error(`Failed to send message: ${response.statusCode}`);
      }

      const result = await response.body.json();
      return result.data;
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const sendMessage = useCallback(async (
    content: string, 
    options?: ChatOptions
  ) => {
    if (!content.trim()) return;
    if (!selectedDataSource) {
      onError?.(new Error('Please select a data source first'));
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      await sendMessageMutation.mutateAsync({ 
        message: content, 
        options 
      });
      // Response will come via WebSocket
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [sendMessageMutation, selectedDataSource, threadId, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const regenerateLastResponse = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === "user");
    
    if (!lastUserMessage) return;

    // Remove the last assistant message if it exists
    setMessages(prev => {
      const lastAssistantIndex = prev.length - 1;
      if (prev[lastAssistantIndex]?.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      content,
      role: "assistant",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    sendMessage,
    addSystemMessage,
    clearMessages,
    removeMessage,
    regenerateLastResponse,
    isLoading: sendMessageMutation.isPending,
    isStreaming,
    error: sendMessageMutation.error,
  };
}
