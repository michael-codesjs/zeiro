import React from 'react';
import { Button } from '../../../ui';
import { Message } from '../types';
import { TypingAnimation } from './TypingAnimation';
import { QueryResultDisplay } from './QueryResultDisplay';

interface ChatMessageProps {
  message: Message;
  animatingMessageId: string | null;
  expandedQueries: Set<string>;
  onToggleQueryExpansion: (queryId: string) => void;
  onApproveQuery: (queryId: string, messageId: string) => void;
  onRejectQuery: (messageId: string) => void;
  onAnimationComplete: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  animatingMessageId,
  expandedQueries,
  onToggleQueryExpansion,
  onApproveQuery,
  onRejectQuery,
  onAnimationComplete
}) => {
  if (message.type === 'user') {
    return (
      <div className="bg-slate-100 rounded-lg px-3 py-2 font-mono text-sm text-slate-800 border-l-4 border-slate-400">
        {message.content}
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="space-y-2">
        {message.isAnimating && animatingMessageId === message.id ? (
          <div className="space-y-2">
            {/* Show query summary first for executing status */}
            {message.queryStatus === 'executing' && message.content && (
              <TypingAnimation 
                text={message.content}
                onComplete={() => {
                  // After query summary, show executing status
                  setTimeout(() => {
                    onAnimationComplete(message.id);
                  }, 500);
                }}
              />
            )}
            
            {/* Show regular status for non-executing or when no content */}
            {(message.queryStatus !== 'executing' || !message.content) && (
              <TypingAnimation 
                text={message.queryStatus === 'generating' ? 'Generating query...' :
                     message.queryStatus === 'pending_approval' ? 'Query ready for approval' :
                     message.queryStatus === 'executing' ? 'Executing query' :
                     message.queryStatus === 'completed' ? 
                       (message.chartData ? 'Chart generated' : 'Query completed') :
                     message.queryStatus === 'failed' ? 'Query failed' :
                     'Processing query'}
                onComplete={() => onAnimationComplete(message.id)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Show query summary for executing status */}
            {message.queryStatus === 'executing' && message.content && (
              <div className="text-sm text-slate-700 leading-relaxed">
                {message.content}
              </div>
            )}
            
            {/* Show executing status with spinner */}
            <div className="flex items-center space-x-2">
              <div className="text-sm text-slate-700 leading-relaxed">
                {message.queryStatus === 'generating' ? 'Generating query...' :
                 message.queryStatus === 'pending_approval' ? 'Query ready for approval' :
                 message.queryStatus === 'executing' ? 'Executing query' :
                 message.queryStatus === 'completed' ? 
                   (message.chartData ? 'Chart generated' : 'Query completed') :
                 message.queryStatus === 'failed' ? 'Query failed' :
                 'Processing query'}
              </div>
              {message.queryStatus === 'executing' && (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              )}
              {message.queryStatus === 'completed' && message.chartData && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {message.queryStatus === 'completed' && !message.chartData && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show Query toggle for query generation messages */}
        {message.queryId && (
          <div className="mt-2">
            <button
              onClick={() => onToggleQueryExpansion(message.queryId!)}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              {expandedQueries.has(message.queryId) ? 'hide query' : 'show query'}
            </button>
          </div>
        )}
        
        {/* Query details (expanded) */}
        {message.queryId && expandedQueries.has(message.queryId) && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-600 mb-2">Generated Query Parameters:</div>
            <div className="space-y-2">
              {/* Show actual DynamoDB parameters as formatted JSON */}
              {message.queryParameters ? (
                <div className="font-mono text-xs bg-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-slate-700">
                    {JSON.stringify(message.queryParameters, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-slate-500 italic text-xs">No query parameters available</div>
              )}
            </div>
          </div>
        )}
        
        {/* Approval buttons for pending queries */}
        {message.queryStatus === 'pending_approval' && message.queryId && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onApproveQuery(message.queryId!, message.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve & Execute
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRejectQuery(message.id)}
              className="text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Assistant message
  return (
    <div className="space-y-3">
      {/* Text Response with Typing Animation */}
      {message.isAnimating && animatingMessageId === message.id ? (
        <TypingAnimation 
          text={message.content}
          onComplete={() => onAnimationComplete(message.id)}
        />
      ) : (
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      )}
      
      {/* Query Result Display */}
      {message.queryResult && (
        <QueryResultDisplay result={message.queryResult} />
      )}
    </div>
  );
}; 