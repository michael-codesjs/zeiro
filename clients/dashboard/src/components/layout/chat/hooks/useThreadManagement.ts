import { useState, useCallback } from 'react';
import { threadAPI } from '../api';
import { Thread, Message } from '../types';
import { type Database } from '../../../../hooks/use-data-sources';

export const useThreadManagement = (selectedDatabase: Database | null, onChartDataUpdate?: (chartData: any) => void) => {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isThreadSelectorOpen, setIsThreadSelectorOpen] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("New chat");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadThreads = useCallback(async () => {
    if (!selectedDatabase) return;
    
    setIsLoadingThreads(true);
    try {
      const response = await threadAPI.listThreads(selectedDatabase.id);
      if (response.success && response.data?.threads) {
        setThreads(response.data.threads);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setIsLoadingThreads(false);
    }
  }, [selectedDatabase]);

  const createNewThread = useCallback(async (initialMessage?: string) => {
    if (!selectedDatabase) return;
    
    try {
      if (initialMessage) {
        return null;
      } else {
        const response = await threadAPI.createThread(selectedDatabase.id, "New chat");
        if (response.success && response.data?.thread_id) {
          setCurrentThreadId(response.data.thread_id);
          setChatTitle("New chat");
          setIsThreadSelectorOpen(false);
          await loadThreads();
          return response.data.thread_id;
        }
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
      return null;
    }
  }, [selectedDatabase, loadThreads]);

  const switchToThread = useCallback(async (
    thread: Thread,
    setMessages: (messages: Message[]) => void,
    setAnimatingMessageId: (id: string | null) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    if (!selectedDatabase) return;
    
    setLoadingThreadId(thread.id);
    setCurrentThreadId(thread.id);
    setChatTitle(thread.title);
    setIsThreadSelectorOpen(false);
    setIsLoading(true);
    
    // Show loading state
    setMessages([{
      id: 'loading',
      type: 'assistant',
      content: 'Loading conversation history...',
      timestamp: new Date(),
      isAnimating: true
    }]);
    setAnimatingMessageId('loading');
    
    try {
      const response = await threadAPI.getThread(selectedDatabase.id, thread.id);
      
      if (response.success && response.data?.thread) {
        const threadData = response.data.thread;
        const convertedMessages: Message[] = [];
        
        if (threadData.messages && Array.isArray(threadData.messages)) {
          const sortedMessages = threadData.messages.sort((a: any, b: any) => {
            const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
            const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
            return timeA - timeB;
          });

          sortedMessages.forEach((msg: any, index: number) => {
            if (msg.role === 'user') {
              convertedMessages.push({
                id: `${thread.id}-user-${index}`,
                type: 'user',
                content: msg.content,
                timestamp: new Date(msg.timestamp || msg.createdAt || Date.now())
              });
            } else if (msg.role === 'assistant') {
              let chartData = null;
              let displayContent = msg.content;
              
              try {
                if (typeof msg.content === 'string' && 
                    msg.content.trim().startsWith('{') && 
                    msg.content.trim().endsWith('}')) {
                  const parsed = JSON.parse(msg.content);
                  if (parsed.message) {
                    displayContent = parsed.message;
                    chartData = parsed;
                  }
                } else if (typeof msg.content === 'object' && msg.content.message) {
                  displayContent = msg.content.message;
                  chartData = msg.content;
                }
              } catch (e) {
                displayContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
              }
              
              convertedMessages.push({
                id: `${thread.id}-assistant-${index}`,
                type: 'assistant',
                content: displayContent,
                timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
                chartData: chartData
              });
            }
          });
        }
        
        if (convertedMessages.length === 0) {
          convertedMessages.push({
            id: `${thread.id}-welcome`,
            type: 'assistant',
            content: `Welcome back to "${thread.title}"! I'm ready to continue our conversation about ${selectedDatabase.name}.`,
            timestamp: new Date(),
            isAnimating: true
          });
          setAnimatingMessageId(`${thread.id}-welcome`);
        }
        
        setMessages(convertedMessages);
        setAnimatingMessageId(null);
        
        // Update chart data with the last chart data from the conversation
        const lastChartMessage = [...convertedMessages]
          .reverse()
          .find(msg => msg.chartData && msg.type === 'assistant');
        
        if (lastChartMessage?.chartData && onChartDataUpdate) {
          onChartDataUpdate(lastChartMessage.chartData);
        }
      } else {
        setMessages([{
          id: `${thread.id}-welcome`,
          type: 'assistant',
          content: `Welcome back to "${thread.title}"! I couldn't load the previous conversation, but I'm ready to help you with ${selectedDatabase.name}.`,
          timestamp: new Date(),
          isAnimating: true
        }]);
        setAnimatingMessageId(`${thread.id}-welcome`);
      }
    } catch (error) {
      console.error('Failed to load thread history:', error);
      
      setMessages([{
        id: `${thread.id}-error`,
        type: 'assistant',
        content: `I had trouble loading the history for "${thread.title}", but I'm here to help! What would you like to explore in ${selectedDatabase.name}?`,
        timestamp: new Date(),
        isAnimating: true
      }]);
      setAnimatingMessageId(`${thread.id}-error`);
    } finally {
      setIsLoading(false);
      setLoadingThreadId(null);
    }
  }, [selectedDatabase, onChartDataUpdate]);

  const startEditingTitle = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const cancelEditingTitle = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const saveThreadTitle = async (threadId: string) => {
    if (!selectedDatabase || !editingTitle.trim()) {
      cancelEditingTitle();
      return;
    }

    try {
      const response = await threadAPI.updateThread(selectedDatabase.id, threadId, editingTitle.trim());
      if (response.success) {
        setThreads(prev => prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, title: editingTitle.trim() }
            : thread
        ));
        
        if (threadId === currentThreadId) {
          setChatTitle(editingTitle.trim());
        }
        
        cancelEditingTitle();
      }
    } catch (error) {
      console.error('Failed to update thread title:', error);
      cancelEditingTitle();
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === 'Enter') {
      saveThreadTitle(threadId);
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  };

  return {
    currentThreadId,
    setCurrentThreadId,
    threads,
    setThreads,
    isThreadSelectorOpen,
    setIsThreadSelectorOpen,
    isLoadingThreads,
    loadingThreadId,
    chatTitle,
    setChatTitle,
    editingThreadId,
    editingTitle,
    setEditingTitle,
    loadThreads,
    createNewThread,
    switchToThread,
    startEditingTitle,
    cancelEditingTitle,
    saveThreadTitle,
    handleTitleKeyPress
  };
}; 