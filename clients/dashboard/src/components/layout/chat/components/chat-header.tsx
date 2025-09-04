import React from 'react';
import { Button } from "../../../ui";
import { Minus, Add } from 'iconsax-reactjs';
import { ModelSelector, ThreadSelector } from './';
import { Model, Thread } from '../types';
import { type Database } from '../../../../hooks/use-data-sources';
import { MODELS } from '../constants';

interface ChatHeaderProps {
  onToggleCollapse: () => void;
  selectedModel: Model | null;
  isModelSelectorOpen: boolean;
  onModelSelectorToggle: () => void;
  onModelSelect: (model: Model) => void;
  threadManagement: any;
  selectedDataSource: Database | null;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleCollapse,
  selectedModel,
  isModelSelectorOpen,
  onModelSelectorToggle,
  onModelSelect,
  threadManagement,
  selectedDataSource,
  onNewChat
}) => {
  return (
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
            onToggle={onModelSelectorToggle}
            onSelect={onModelSelect}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 relative">
        {/* Thread Selector */}
        <ThreadSelector
          isOpen={threadManagement.isThreadSelectorOpen}
          onToggle={() => threadManagement.setIsThreadSelectorOpen(!threadManagement.isThreadSelectorOpen)}
          selectedDatabase={selectedDataSource}
          threads={threadManagement.threads}
          currentThreadId={threadManagement.currentThreadId}
          isLoadingThreads={threadManagement.isLoadingThreads}
          loadingThreadId={threadManagement.loadingThreadId}
          editingThreadId={threadManagement.editingThreadId}
          editingTitle={threadManagement.editingTitle}
          onThreadSwitch={threadManagement.switchToThread}
          onStartEditing={threadManagement.startEditingTitle}
          onTitleChange={threadManagement.setEditingTitle}
          onTitleKeyPress={threadManagement.handleTitleKeyPress}
          onTitleSave={threadManagement.saveThreadTitle}
        />
        
        {/* New Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="p-2 h-auto hover:bg-slate-100"
          disabled={!selectedDataSource}
          title="Start new chat"
        >
          <Add size={14} className='text-slate-900'/>
        </Button>
      </div>
    </div>
  );
};
