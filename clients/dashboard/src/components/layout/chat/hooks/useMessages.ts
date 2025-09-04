import { useState, useEffect, useCallback } from 'react';
import { Message, Model } from '../types';
import { type Database } from '../../../../hooks/use-data-sources';
import { 
  useGenerateQuery,
  useExecuteGeneratedQuery,
  type QueryGenerationResult
} from "../../../../hooks/use-natural-language-query";
import { useCreateDynamodbQuery, type ManualQueryParams } from "../../../../hooks/use-manual-query";
import { useWebSocketStore } from "../../../../stores/websocket-store";
import { CHAT_CONFIG } from '../constants';

interface UseMessagesProps {
  selectedDataSource: Database | null;
  selectedModel: Model | null;
  threadManagement: any;
  onChartDataUpdate?: (chartData: any) => void;
}

export const useMessages = ({ 
  selectedDataSource, 
  selectedModel, 
  threadManagement,
  onChartDataUpdate 
}: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);
  const [autoApprove, setAutoApprove] = useState(CHAT_CONFIG.AUTO_APPROVE_DEFAULT);
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());

  // Query hooks
  const generateQuery = useGenerateQuery();
  const executeGeneratedQueryMutation = useExecuteGeneratedQuery();
  const createDynamodbQuery = useCreateDynamodbQuery();
  
  // WebSocket store - just get execution results
  const execution_results = useWebSocketStore(state => state.execution_results);

  // Update welcome message when database changes
  useEffect(() => {
    setMessages([])
  }, [selectedDataSource]);

  // Listen for execution results from WebSocket
  useEffect(() => {
    if (execution_results.length === 0) return;
    
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
      
      if (latestResult.payload.result && onChartDataUpdate) {
        console.log('📊 Updating chart data:', latestResult.payload.result);
        onChartDataUpdate(latestResult.payload.result);
      }
      
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

  const handleAsyncQuery = useCallback(async (currentQuery: string) => {
    const queryParams: any = {
      database_id: selectedDataSource!.id,
      natural_language_query: currentQuery
    };
    
    // Include thread_id if we have one from previous conversation
    if (threadManagement.currentThreadId) {
      queryParams.thread_id = threadManagement.currentThreadId;
    }

    if (selectedModel) {
      queryParams.model = selectedModel.id;
    }

    console.log('🚀 Sending query with params:', queryParams);

    const generateResponse = await generateQuery.mutateAsync(queryParams);

    if (generateResponse.success && generateResponse.data) {
      const result = generateResponse.data;
      
      console.log('📥 Received response:', result);
      
      // Handle thread creation/update - save threadId for future requests
      if (result.thread_id && !threadManagement.currentThreadId) {
        console.log('💾 Setting new thread ID:', result.thread_id);
        threadManagement.setCurrentThreadId(result.thread_id);
        await threadManagement.loadThreads();
        threadManagement.setChatTitle("Loading...");
        
        try {
          await threadManagement.loadThreads();
        } catch (error) {
          console.error('Failed to fetch thread title:', error);
          threadManagement.setChatTitle("New Conversation");
        }
      } else if (result.thread_id && threadManagement.currentThreadId !== result.thread_id) {
        // Update thread ID if it changed
        console.log('🔄 Updating thread ID:', result.thread_id);
        threadManagement.setCurrentThreadId(result.thread_id);
      }

      // Always show the message from the response
      if (result.message) {
        const messageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: messageId,
          type: 'assistant',
          content: result.message,
          timestamp: new Date(),
          isAnimating: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setAnimatingMessageId(messageId);
      }

      // If query parameters are provided, execute the query automatically
      if (result.query_parameters && selectedDataSource) {
        console.log('🔍 Query parameters received, executing query:', result.query_parameters);
        
        try {
          // Convert the query parameters to ManualQueryParams format
          const queryParams: ManualQueryParams = {
            database_id: selectedDataSource.id,
            table_name: selectedDataSource.name,
            ...result.query_parameters
          };

          console.log('🚀 Executing DynamoDB query with params:', queryParams);
          
          // Create and execute the query (this will show results in the data viewer)
          const queryResult = await createDynamodbQuery.mutateAsync(queryParams);
          
          if (queryResult.success) {
            console.log('✅ Query executed successfully, execution_id:', queryResult.data?.execution_id);
            
            // Add a system message to indicate query execution
            const queryMessageId = (Date.now() + 2).toString();
            const queryMessage: Message = {
              id: queryMessageId,
              type: 'system',
              content: 'Executing query...',
              timestamp: new Date(),
              queryStatus: 'executing',
              executionId: queryResult.data?.execution_id,
              queryParameters: result.query_parameters,
              isAnimating: true
            };
            setMessages(prev => [...prev, queryMessage]);
            setAnimatingMessageId(queryMessageId);
          }
        } catch (error) {
          console.error('❌ Failed to execute query:', error);
          
          // Add error message
          const errorMessageId = (Date.now() + 2).toString();
          const errorMessage: Message = {
            id: errorMessageId,
            type: 'assistant',
            content: 'Sorry, I encountered an error while executing the query. Please try again.',
            timestamp: new Date(),
            isAnimating: true
          };
          setMessages(prev => [...prev, errorMessage]);
          setAnimatingMessageId(errorMessageId);
        }
      }
    } else {
      throw new Error(generateResponse.error || 'Request failed');
    }
  }, [selectedDataSource, selectedModel, threadManagement, generateQuery, createDynamodbQuery]);

  const executeGeneratedQuery = useCallback(async (queryId: string, messageId?: string) => {
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
  }, [executeGeneratedQueryMutation]);

  const handleSendMessage = useCallback(async (inputValue: string) => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue.trim();
    setIsLoading(true);

    try {
      if (selectedDataSource && selectedDataSource.type === 'DynamoDB') {
        await handleAsyncQuery(currentQuery);
      } else {
        const messageId = (Date.now() + 1).toString();
        const content = selectedDataSource 
          ? `I can help you with ${selectedDataSource.type} queries, but natural language querying is currently only supported for DynamoDB databases. Would you like me to help you write a manual query instead?`
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
  }, [isLoading, selectedDataSource, handleAsyncQuery]);

  const handleAnimationComplete = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isAnimating: false }
          : msg
      )
    );
    setAnimatingMessageId(null);
  }, []);

  const handleToggleQueryExpansion = useCallback((queryId: string) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  }, []);

  const handleApproveQuery = useCallback(async (queryId: string, messageId: string) => {
    try {
      await executeGeneratedQuery(queryId, messageId);
    } catch (error) {
      console.error('Failed to execute query:', error);
    }
  }, [executeGeneratedQuery]);

  const handleRejectQuery = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const handleNewChat = useCallback(() => {
    if (!selectedDataSource) return;
    threadManagement.setCurrentThreadId(null);
    threadManagement.setChatTitle("New chat");
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your AI assistant. I can help you query ${selectedDataSource.name} using natural language. Just ask me what data you're looking for!`,
      timestamp: new Date(),
      isAnimating: true
    }]);
    setAnimatingMessageId('1');
    threadManagement.setIsThreadSelectorOpen(false);
    if (onChartDataUpdate) {
      onChartDataUpdate(null);
    }
  }, [selectedDataSource, threadManagement, onChartDataUpdate]);

  return {
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
  };
};
