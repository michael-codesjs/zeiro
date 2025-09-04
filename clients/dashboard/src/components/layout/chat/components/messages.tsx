import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '.';
import { Message } from '../types';

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
  animatingMessageId: string | null;
  expandedQueries: Set<string>;
  onToggleQueryExpansion: (queryId: string) => void;
  onApproveQuery: (queryId: string, messageId: string) => void;
  onRejectQuery: (messageId: string) => void;
  onAnimationComplete: (messageId: string) => void;
}

export const Messages: React.FC<MessagesProps> = ({
  messages,
  isLoading,
  animatingMessageId,
  expandedQueries,
  onToggleQueryExpansion,
  onApproveQuery,
  onRejectQuery,
  onAnimationComplete
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="max-w-xs mx-auto px-6">
            <p className="text-slate-400 text-xs">
              Ask questions about your data, request queries, or get insights from your database.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <ChatMessage
                message={message}
                animatingMessageId={animatingMessageId}
                expandedQueries={expandedQueries}
                onToggleQueryExpansion={onToggleQueryExpansion}
                onApproveQuery={onApproveQuery}
                onRejectQuery={onRejectQuery}
                onAnimationComplete={onAnimationComplete}
              />
            </div>
          ))}
          
          {isLoading && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
