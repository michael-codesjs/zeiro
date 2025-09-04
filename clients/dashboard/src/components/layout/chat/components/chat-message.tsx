import React, { useEffect } from 'react';
import { Button } from '../../../ui';
import { TypingAnimation } from './TypingAnimation';
import { Message } from '../types';
import { 
  ArrowDown2, 
  ArrowUp2, 
  TickCircle, 
  CloseCircle, 
  Clock, 
  InfoCircle 
} from 'iconsax-reactjs';

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
  useEffect(() => {
    if (message.isAnimating && message.id === animatingMessageId) {
      const timer = setTimeout(() => {
        onAnimationComplete(message.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.isAnimating, message.id, animatingMessageId, onAnimationComplete]);

  const getStatusIcon = () => {
    switch (message.queryStatus) {
      case 'pending_approval':
        return <Clock size={16} className="text-amber-500" />;
      case 'executing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <TickCircle size={16} className="text-green-500" />;
      case 'failed':
        return <InfoCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (message.queryStatus) {
      case 'pending_approval':
        return 'Waiting for approval';
      case 'executing':
        return 'Executing query...';
      case 'completed':
        return 'Query completed';
      case 'failed':
        return 'Query failed';
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${message.type === 'user' ? 'ml-16' : 'mr-16'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.type === 'user'
              ? 'bg-indigo-500 text-white'
              : message.type === 'system'
              ? 'bg-slate-100'
              : 'bg-slate-100'
          }`}
        >
          {/* Message Content */}
          <div className={`text-sm leading-relaxed ${
            message.type === 'user' ? 'text-white' : 'text-slate-800'
          }`}>
            {message.isAnimating && message.id === animatingMessageId ? (
              <TypingAnimation text={message.content} onComplete={() => onAnimationComplete(message.id)} />
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {/* Query Status */}
          {message.queryStatus && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-xs ${
                    message.type === 'user' ? 'text-indigo-100' : 'text-slate-500'
                  }`}>{getStatusText()}</span>
                </div>
                
                {/* Query Parameters Toggle */}
                {message.queryParameters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleQueryExpansion(message.queryId!)}
                    className="p-1 h-auto hover:bg-slate-200/50"
                  >
                    {expandedQueries.has(message.queryId!) ? (
                      <ArrowUp2 size={14} className={message.type === 'user' ? 'text-indigo-100' : 'text-slate-500'} />
                    ) : (
                      <ArrowDown2 size={14} className={message.type === 'user' ? 'text-indigo-100' : 'text-slate-500'} />
                    )}
                  </Button>
                )}
              </div>

              {/* Expanded Query Parameters */}
              {message.queryParameters && expandedQueries.has(message.queryId!) && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs">
                  <pre className="whitespace-pre-wrap text-slate-600 font-mono">
                    {JSON.stringify(message.queryParameters, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              {message.queryStatus === 'pending_approval' && (
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => onApproveQuery(message.queryId!, message.id)}
                    className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white border-0"
                  >
                    <TickCircle size={12} />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRejectQuery(message.id)}
                    className="flex items-center space-x-1 hover:bg-red-50 text-red-600"
                  >
                    <CloseCircle size={12} />
                    <span>Reject</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-slate-400 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
