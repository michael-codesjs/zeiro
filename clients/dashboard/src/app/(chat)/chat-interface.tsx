"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { useChat, type ChatOptions } from "@/hooks/use-chat";
import { motion } from "framer-motion";
import { ChatInput } from "./chat-input";
import { useSelectedDataSourceStore } from "@/hooks/use-selected-data-source-store";
import { ToolCallDisplay } from "@/components/ui/tool-call-display";
import { DataVisualization } from "@/components/ui/data-visualization";
import { 
  SearchNormal1, 
  Lamp
} from "iconsax-reactjs";

interface ChatFormData {
  message: string;
}

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  
  const [chatOptions, setChatOptions] = useState<ChatOptions>({});
  const { messages, sendMessage, addSystemMessage, isLoading, isStreaming } = useChat({
    onError: (error) => {
      // Handle errors from useChat (like missing data source)
      console.error('Chat error:', error.message);
    }
  });
  const { selectedDataSource } = useSelectedDataSourceStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isStreaming]);

  const handleChatSubmit = async (data: ChatFormData) => {
    if (!data.message.trim()) return;
    
    // Check if data source is selected
    if (!selectedDataSource) {
      addSystemMessage("Please select a data source first to start chatting. You can choose one from the dropdown above.");
      return;
    }
    
    await sendMessage(data.message, chatOptions);
    setChatOptions({}); // Reset options after sending
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {messages.length === 0 ? (
        // Empty state - centered input
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <ChatInput 
            onSubmit={handleChatSubmit}
            isLoading={isLoading}
            size="large"
          />
        </div>
      ) : (
        // Chat with messages - input at bottom
        <>
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6"
          >
            <div className="w-full max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-900"
                    )}
                  >
                    {/* Tool calls for assistant messages - vertical flow */}
                    {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {message.toolCalls.map((toolCall) => (
                          <ToolCallDisplay 
                            key={toolCall.id} 
                            toolCall={toolCall}
                          />
                        ))}
                      </div>
                    )}
                    
                    {message.content && (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}

                    {/* Data visualizations for assistant messages */}
                    {message.role === "assistant" && message.visualizations && message.visualizations.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {message.visualizations.map((visualization) => (
                          <DataVisualization 
                            key={visualization.id} 
                            visualization={visualization}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Metadata for assistant messages */}
                    {message.role === "assistant" && message.metadata && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {message.metadata.sources && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <SearchNormal1 size={12} />
                            <span>Sources: {message.metadata.sources.join(", ")}</span>
                          </div>
                        )}
                        {message.metadata.reasoning && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Lamp size={12} />
                            <span>{message.metadata.reasoning}</span>
                          </div>
                        )}
                        {message.metadata.confidence && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {(isStreaming || messages.some(m => m.isStreaming)) && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Input */}
          <ChatInput 
            onSubmit={handleChatSubmit}
            isLoading={isLoading}
            size="compact"
          />
        </>
      )}
    </div>
  );
}