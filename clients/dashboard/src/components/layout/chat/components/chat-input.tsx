import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../../../ui";
import { Setting3, Send2 } from 'iconsax-reactjs';
import { type Database } from '../../../../hooks/use-data-sources';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedDataSource: Database | null;
  autoApprove: boolean;
  onAutoApproveToggle: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedDataSource,
  autoApprove,
  onAutoApproveToggle
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="p-4 min-h-20 border-t border-slate-200">
      <div className="flex space-x-2 items-center h-full">
        {/* Auto-approval Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoApproveToggle}
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
          placeholder={selectedDataSource 
            ? `Ask me about ${selectedDataSource.name} data...` 
            : "Ask me anything about your data..."}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="rotate-90"
        >
          <Send2 size={16} />
        </Button>
      </div>
    </div>
  );
};
