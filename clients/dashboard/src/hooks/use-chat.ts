"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  metadata?: {
    sources?: string[];
    reasoning?: string;
    confidence?: number;
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
  const queryClient = useQueryClient();

  // Simulate API call - replace with actual API integration
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      options 
    }: { 
      message: string; 
      options?: ChatOptions 
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate different responses based on options
      let response = "I understand your question. Let me help you analyze that data.";
      
      if (options?.deepSearch) {
        response = "I've performed a deep search across your data sources. Here are the key insights I found...";
      } else if (options?.reasoning) {
        response = "Let me walk you through my reasoning process for this analysis...";
      }
      
      return {
        content: response,
        metadata: {
          sources: options?.deepSearch ? ["Database A", "API Endpoint B"] : undefined,
          reasoning: options?.reasoning ? "Applied statistical analysis and pattern recognition" : undefined,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        }
      };
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

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessageMutation.mutateAsync({ 
        message: content, 
        options 
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Remove user message on error or add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [sendMessageMutation]);

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

  return {
    messages,
    sendMessage,
    clearMessages,
    removeMessage,
    regenerateLastResponse,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
