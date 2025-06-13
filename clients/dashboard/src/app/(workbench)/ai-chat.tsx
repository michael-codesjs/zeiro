"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../../components/ui";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export default function AiChat({ isCollapsed = false, onToggleCollapse }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you write queries, analyze your data, and answer questions about your databases. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(400); // Increased default width
  const [isResizing, setIsResizing] = useState(false);
  const [chatTitle] = useState("New chat");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  
  // Sample models - in real app this would come from API
  const [models] = useState<Model[]>([
    {
      id: '1',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'Most capable model for complex database queries'
    },
    {
      id: '2', 
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Excellent for data analysis and SQL optimization'
    },
    {
      id: '3',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Optimized for speed and efficiency'
    },
    {
      id: '4',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fast and lightweight for simple queries'
    },
    {
      id: '5',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Great for database schema understanding'
    },
    {
      id: '6',
      name: 'Gemini Flash',
      provider: 'Google',
      description: 'Quick responses for basic database tasks'
    },
    {
      id: '7',
      name: 'Llama 3.1 70B',
      provider: 'Meta',
      description: 'Open-source model for data processing'
    },
    {
      id: '8',
      name: 'Mistral Large',
      provider: 'Mistral AI',
      description: 'European AI model for data compliance'
    }
  ]);

  // Set default model
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    
    // Set min and max width constraints
    const minWidth = 300;
    const maxWidth = 600;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I understand you're asking about that. Let me help you with a detailed response. This is a simulated AI response for now.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
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
      style={{ width: `${width}px` }}
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
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20h12" />
              </svg>
            </Button>
          <div className="">
            <h3 className="font-semibold text-slate-900 text-sm">{chatTitle}</h3>
            <div className="relative">
            <button
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="flex items-center space-x-1 text-xs transition-colors"
            >
              <span className="text-slate-700 text-xs max-w-28 truncate">
                {selectedModel ? selectedModel.name : 'Model'}
              </span>
              <svg 
                className={`w-3 h-3 text-slate-400 transition-transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isModelSelectorOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <div className="p-1">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelSelectorOpen(false);
                      }}
                      className={`w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors ${
                        selectedModel?.id === model.id ? 'bg-indigo-50 border border-indigo-200' : ''
                      }`}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {model.name}
                          </p>
                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {model.provider}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
          
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Model Selector */}
       
          
          {/* History Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 h-auto"
            onClick={() => {/* Handle history */}}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
          
          {/* New Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 h-auto"
            onClick={() => {/* Handle new chat */}}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            {message.type === 'user' ? (
              // User command message
              <div className="bg-slate-100 rounded-lg px-3 py-2 font-mono text-sm text-slate-800 border-l-4 border-slate-400">
                {message.content}
              </div>
            ) : (
              // AI response message
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}
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
          <textarea
            ref={inputRef}
            className="w-full h-auto max-h-60 text-slate-700 text-xs focus:outline-none focus:ring-0 resize-none flex items-center"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data..."
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="rotate-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
} 