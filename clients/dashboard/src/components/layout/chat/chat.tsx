"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "../../ui";
import { 
  useGenerateQuery,
  useExecuteGeneratedQuery,
  type QueryGenerationResult
} from "../../../hooks/use-natural-language-query";
import { useWebSocketStore } from "../../../stores/websocket-store";
import { 
  Maximize,
  Minus,
  Add,
  Setting3,
  Send2
} from 'iconsax-reactjs';

// Import types and constants
import { AiChatProps, Message, Model } from './types';
import { MODELS, CHAT_CONFIG } from './constants';

// Import components
import { 
  ModelSelector, 
  ThreadSelector, 
  ChatMessage 
} from './components';

// Import hooks
import { useThreadManagement } from './hooks';

export default function AiChat({ 
  isCollapsed = false, 
  onToggleCollapse, 
  selectedDatabase, 
  onChartDataUpdate 
}: AiChatProps) {
  // Basic state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(CHAT_CONFIG.DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);
  const [autoApprove, setAutoApprove] = useState(CHAT_CONFIG.AUTO_APPROVE_DEFAULT);
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());
  
  // Thread management hook
  const threadManagement = useThreadManagement(selectedDatabase, onChartDataUpdate);
  
  // Query hooks
  const generateQuery = useGenerateQuery();
  const executeGeneratedQueryMutation = useExecuteGeneratedQuery();
  
  // WebSocket store - just get execution results
  const execution_results = useWebSocketStore(state => state.execution_results);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Set default model
  useEffect(() => {
    if (!selectedModel && MODELS.length > 0) {
      setSelectedModel(MODELS[0]);
    }
  }, [selectedModel]);

  // Update welcome message and load threads when database changes
  useEffect(() => {
    if (selectedDatabase) {
      threadManagement.loadThreads();
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I'm your AI assistant. I can help you query ${selectedDatabase.name} using natural language. Just ask me what data you're looking for!`,
        timestamp: new Date(),
        isAnimating: true
      }]);
      setAnimatingMessageId('1');
      threadManagement.setCurrentThreadId(null);
      threadManagement.setChatTitle("New chat");
      if (onChartDataUpdate) {
        onChartDataUpdate(null);
      }
    } else {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: "Hi! I'm your AI assistant. Select a database to start querying with natural language, or I can help you with general database questions.",
        timestamp: new Date(),
        isAnimating: true
      }]);
      setAnimatingMessageId('1');
      threadManagement.setThreads([]);
      threadManagement.setCurrentThreadId(null);
      threadManagement.setChatTitle("New chat");
      if (onChartDataUpdate) {
        onChartDataUpdate(null);
      }
    }
  }, [selectedDatabase, threadManagement.loadThreads]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for execution results from WebSocket
  useEffect(() => {
    if (execution_results.length === 0) return;
    
    // Get the latest result
    const latestResult = execution_results[execution_results.length - 1];
    
    console.log('🎯 Processing execution result in AiChat:', {
      type: latestResult.type,
      executionId: latestResult.executionId,
      status: latestResult.payload?.status,
      hasResult: !!latestResult.payload?.result,
    });

    // Handle completed queries
    if (latestResult.payload?.status === 'executed' && latestResult.payload?.result) {
      console.log('✅ Processing completed query result:', latestResult.payload.result);
      
      // Update chart data if callback provided
      if (latestResult.payload.result && onChartDataUpdate) {
        console.log('📊 Updating chart data:', latestResult.payload.result);
        onChartDataUpdate(latestResult.payload.result);
      }
      
      // Update message state
      setMessages(prev => prev.map(msg => {
        if (msg.executionId === latestResult.executionId) {
          const hasChartData = latestResult.payload.result && (
            latestResult.payload.result.chartType || 
            latestResult.payload.result.chartData || 
            latestResult.payload.result.data
          );
          
          return { 
            ...msg, 
            queryStatus: 'completed',
            chartData: hasChartData ? latestResult.payload.result : undefined,
          };
        }
        return msg;
      }));
    }

    // Handle failed queries
    if (latestResult.payload?.status === 'failed') {
      console.log('❌ Processing failed query result:', latestResult.payload.error);
      
      setMessages(prev => prev.map(msg => 
        msg.executionId === latestResult.executionId
          ? { ...msg, queryStatus: 'failed' }
          : msg
      ));
    }
  }, [execution_results, onChartDataUpdate]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !chatRef.current) return;
    
    const rect = chatRef.current.getBoundingClientRect();
    const newWidth = rect.right - e.clientX;
    
    if (newWidth >= CHAT_CONFIG.MIN_WIDTH && newWidth <= CHAT_CONFIG.MAX_WIDTH) {
      setWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      if (selectedDatabase && selectedDatabase.type === 'DynamoDB') {
        await handleAsyncQuery(currentQuery);
      } else {
        const messageId = (Date.now() + 1).toString();
        const content = selectedDatabase 
          ? `I can help you with ${selectedDatabase.type} queries, but natural language querying is currently only supported for DynamoDB databases. Would you like me to help you write a manual query instead?`
          : "I'd be happy to help! Please select a database first, or ask me a general question about databases and querying.";
        
        const aiMessage: Message = {
          id: messageId,
          type: 'assistant',
          content,
          timestamp: new Date(),
          isAnimating: true
        };
        setMessages(prev => [...prev, aiMessage]);
        setAnimatingMessageId(messageId);
      }
    } catch (error) {
      console.error('Query error:', error);
      const messageId = (Date.now() + 1).toString();
      const errorMessage: Message = {
        id: messageId,
        type: 'assistant',
        content: "I encountered an error while processing your query. Please try again or rephrase your question.",
        timestamp: new Date(),
        isAnimating: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setAnimatingMessageId(messageId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsyncQuery = async (currentQuery: string) => {
    const queryParams: any = {
      database_id: selectedDatabase!.id,
      natural_language_query: currentQuery
    };
    
    if (threadManagement.currentThreadId) {
      queryParams.thread_id = threadManagement.currentThreadId;
    }

    if (selectedModel) {
      queryParams.model = selectedModel.id;
    }

    const generateResponse = await generateQuery.mutateAsync(queryParams);

    if (generateResponse.success && generateResponse.data) {
      const generationResult = generateResponse.data as QueryGenerationResult;
      
      if (!threadManagement.currentThreadId && generationResult.thread_id) {
        threadManagement.setCurrentThreadId(generationResult.thread_id);
        await threadManagement.loadThreads();
        threadManagement.setChatTitle("Loading...");
        
        try {
          const threadResponse = await threadManagement.loadThreads();
          // Additional logic for setting thread title could go here
        } catch (error) {
          console.error('Failed to fetch thread title:', error);
          threadManagement.setChatTitle("New Conversation");
        }
      }

      if (generationResult.response_type === 'conversation') {
        const conversationMessageId = (Date.now() + 1).toString();
        const conversationMessage: Message = {
          id: conversationMessageId,
          type: 'assistant',
          content: generationResult.conversation_response || generationResult.explanation || 'I can help you with that.',
          timestamp: new Date(),
          isAnimating: true
        };
        setMessages(prev => [...prev, conversationMessage]);
        setAnimatingMessageId(conversationMessageId);
      } else if (generationResult.response_type === 'query' && generationResult.query_id) {
        const generationMessageId = (Date.now() + 1).toString();
        
        const generationMessage: Message = {
          id: generationMessageId,
          type: 'system',
          content: generationResult.explanation || 'Query generated successfully',
          timestamp: new Date(),
          queryStatus: 'pending_approval',
          queryId: generationResult.query_id,
          queryParameters: generationResult.parameters,
          isAnimating: true
        };
        setMessages(prev => [...prev, generationMessage]);
        setAnimatingMessageId(generationMessageId);

        if (autoApprove) {
          console.log('Auto-approving query, executing immediately...');
          await executeGeneratedQuery(generationResult.query_id!, generationMessageId);
        }
      }
    } else {
      throw new Error(generateResponse.error || 'Request failed');
    }
  };

  const executeGeneratedQuery = async (queryId: string, messageId?: string) => {
    console.log('🚀 Executing query:', { queryId, messageId });

    try {
      if (messageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, queryStatus: 'executing' }
            : msg
        ));
      }

      const executeResponse = await executeGeneratedQueryMutation.mutateAsync(queryId);
      
      if (executeResponse.success && executeResponse.data) {
        const executionResult = executeResponse.data as any;
        console.log('Query execution initiated, execution ID:', executionResult.execution_id);
        
        if (messageId && executionResult.execution_id) {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, executionId: executionResult.execution_id }
              : msg
          ));
        }
      } else {
        throw new Error(executeResponse.error || 'Failed to execute query');
      }
    } catch (error) {
      console.error('Failed to execute query:', error);
      
      if (messageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, queryStatus: 'failed' }
            : msg
        ));
      }
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnimationComplete = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isAnimating: false }
          : msg
      )
    );
    setAnimatingMessageId(null);
  };

  const handleToggleQueryExpansion = (queryId: string) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  };

  const handleApproveQuery = async (queryId: string, messageId: string) => {
    try {
      await executeGeneratedQuery(queryId, messageId);
    } catch (error) {
      console.error('Failed to execute query:', error);
    }
  };

  const handleRejectQuery = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleNewChat = () => {
    if (!selectedDatabase) return;
    threadManagement.setCurrentThreadId(null);
    threadManagement.setChatTitle("New chat");
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your AI assistant. I can help you query ${selectedDatabase.name} using natural language. Just ask me what data you're looking for!`,
      timestamp: new Date(),
      isAnimating: true
    }]);
    setAnimatingMessageId('1');
    threadManagement.setIsThreadSelectorOpen(false);
    if (onChartDataUpdate) {
      onChartDataUpdate(null);
    }
  };

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
        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 animate-pulse"></div>
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
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-10 group"
      >
        <div className="w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
      </div>

      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-auto"
          >
            <Minus size={16} className="text-slate-600" />
          </Button>
          <div className="flex-1 min-w-0">
            {/* Chat Title */}
            <h3 className="font-semibold text-slate-900 text-sm truncate max-w-32">
              {threadManagement.chatTitle}
            </h3>

            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              models={MODELS}
              isOpen={isModelSelectorOpen}
              onToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              onSelect={setSelectedModel}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 relative">
          {/* Thread Selector */}
          <ThreadSelector
            isOpen={threadManagement.isThreadSelectorOpen}
            onToggle={() => threadManagement.setIsThreadSelectorOpen(!threadManagement.isThreadSelectorOpen)}
            selectedDatabase={selectedDatabase}
            threads={threadManagement.threads}
            currentThreadId={threadManagement.currentThreadId}
            isLoadingThreads={threadManagement.isLoadingThreads}
            loadingThreadId={threadManagement.loadingThreadId}
            editingThreadId={threadManagement.editingThreadId}
            editingTitle={threadManagement.editingTitle}
            onThreadSwitch={(thread) => threadManagement.switchToThread(thread, setMessages, setAnimatingMessageId, setIsLoading)}
            onStartEditing={threadManagement.startEditingTitle}
            onTitleChange={threadManagement.setEditingTitle}
            onTitleKeyPress={threadManagement.handleTitleKeyPress}
            onTitleSave={threadManagement.saveThreadTitle}
          />
          
          {/* New Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="p-2 h-auto hover:bg-slate-100"
            disabled={!selectedDatabase}
            title="Start new chat"
          >
            <Add size={14} className='text-slate-900'/>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <ChatMessage
              message={message}
              animatingMessageId={animatingMessageId}
              expandedQueries={expandedQueries}
              onToggleQueryExpansion={handleToggleQueryExpansion}
              onApproveQuery={handleApproveQuery}
              onRejectQuery={handleRejectQuery}
              onAnimationComplete={handleAnimationComplete}
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
      </div>

      {/* Input */}
      <div className="p-4 min-h-20 border-t border-slate-200">
        <div className="flex space-x-2 items-center h-full">
          {/* Auto-approval Toggle */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoApprove(!autoApprove)}
              className={`p-2 h-auto hover:bg-slate-100 ${autoApprove ? 'text-green-600' : 'text-slate-400'}`}
              title={autoApprove ? "Auto-approval ON - Queries execute immediately" : "Auto-approval OFF - Manual approval required"}
            >
              <Setting3 size={14} />
              {autoApprove && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </Button>
          </div>
          
          <textarea
            ref={inputRef}
            className="w-full h-auto max-h-60 text-slate-700 text-xs focus:outline-none focus:ring-0 resize-none flex items-center"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedDatabase 
              ? `Ask me about ${selectedDatabase.name} data...` 
              : "Ask me anything about your data..."}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="rotate-90"
          >
            <Send2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
} 