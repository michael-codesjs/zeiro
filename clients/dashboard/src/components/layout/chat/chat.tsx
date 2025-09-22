"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "../../ui";
import { Maximize } from 'iconsax-reactjs';

// Import types and constants
import { ChatProps, Model } from './types';
import { MODELS } from './constants';

// Import components
import { 
  ChatHeader,
  ChatInput,
  Messages
} from './components';

// Import hooks
import { useThreadManagement, useResize, useMessages } from './hooks';

export default function Chat({ 
  isCollapsed = false, 
  onToggleCollapse, 
  selectedDataSource, 
  onChartDataUpdate 
}: ChatProps) {
  // State
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  
  // Custom hooks
  const threadManagement = useThreadManagement(selectedDataSource, onChartDataUpdate);
  const { width, chatRef, resizeRef, handleMouseDown } = useResize();
  const {
    messages,
    setMessages,
    isLoading,
    animatingMessageId,
    autoApprove,
    setAutoApprove,
    expandedQueries,
    handleSendMessage,
    handleAnimationComplete,
    handleToggleQueryExpansion,
    handleApproveQuery,
    handleRejectQuery,
    handleNewChat
  } = useMessages({
    selectedDataSource,
    selectedModel,
    threadManagement,
    onChartDataUpdate
  });

  // Set default model
  useEffect(() => {
    if (!selectedModel && MODELS.length > 0) {
      setSelectedModel(MODELS[0]);
    }
  }, [selectedModel]);

  // Load threads when database changes
  useEffect(() => {
    if (selectedDataSource) {
      threadManagement.loadThreads();
      threadManagement.setCurrentThreadId(null);
      threadManagement.setChatTitle("New chat");
      if (onChartDataUpdate) {
        onChartDataUpdate(null);
      }
    } else {
      threadManagement.setThreads([]);
      threadManagement.setCurrentThreadId(null);
      threadManagement.setChatTitle("New chat");
      if (onChartDataUpdate) {
        onChartDataUpdate(null);
      }
    }
  }, [selectedDataSource, threadManagement.loadThreads]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.thread-selector') && !target.closest('.model-selector')) {
        threadManagement.setIsThreadSelectorOpen(false);
        setIsModelSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-l border-slate-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2 h-auto"
        >
          <Maximize size={16} className="text-slate-600" />
        </Button>
        
        {/* Notification dot for new messages */}
        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div 
      ref={chatRef}
      className="bg-white border-l border-slate-200 flex flex-col h-full relative"
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-gray-500 transition-colors z-10 group"
      >
        <div className="w-1 h-full bg-transparent group-hover:bg-gray-500 transition-colors"></div>
      </div>

      <ChatHeader
        onToggleCollapse={onToggleCollapse!}
        selectedModel={selectedModel}
        isModelSelectorOpen={isModelSelectorOpen}
        onModelSelectorToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
        onModelSelect={setSelectedModel}
        threadManagement={threadManagement}
        selectedDataSource={selectedDataSource}
        onNewChat={handleNewChat}
      />

      <Messages
        messages={messages}
        isLoading={isLoading}
        animatingMessageId={animatingMessageId}
        expandedQueries={expandedQueries}
        onToggleQueryExpansion={handleToggleQueryExpansion}
        onApproveQuery={handleApproveQuery}
        onRejectQuery={handleRejectQuery}
        onAnimationComplete={handleAnimationComplete}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedDataSource={selectedDataSource}
        autoApprove={autoApprove}
        onAutoApproveToggle={() => setAutoApprove(!autoApprove)}
      />
    </div>
  );
} 