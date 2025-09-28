"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { useChat, type ChatOptions } from "@/hooks/use-chat";
import { motion } from "framer-motion";
import { ChatInput } from "./chat-input";
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
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleChatSubmit = async (data: ChatFormData) => {
    if (!data.message.trim()) return;
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
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
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

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
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