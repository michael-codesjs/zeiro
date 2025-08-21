import React from 'react';
import { MessageTime, Edit } from 'iconsax-reactjs';
import { Button } from '../../../ui';
import { Thread } from '../types';

interface ThreadSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedDatabase: any;
  threads: Thread[];
  currentThreadId: string | null;
  isLoadingThreads: boolean;
  loadingThreadId: string | null;
  editingThreadId: string | null;
  editingTitle: string;
  onThreadSwitch: (thread: Thread) => void;
  onStartEditing: (thread: Thread) => void;
  onTitleChange: (title: string) => void;
  onTitleKeyPress: (e: React.KeyboardEvent, threadId: string) => void;
  onTitleSave: (threadId: string) => void;
}

export const ThreadSelector: React.FC<ThreadSelectorProps> = ({
  isOpen,
  onToggle,
  selectedDatabase,
  threads,
  currentThreadId,
  isLoadingThreads,
  loadingThreadId,
  editingThreadId,
  editingTitle,
  onThreadSwitch,
  onStartEditing,
  onTitleChange,
  onTitleKeyPress,
  onTitleSave
}) => {
  return (
    <div className="relative thread-selector">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="p-2 h-auto hover:bg-slate-100"
        disabled={!selectedDatabase}
        title="Show past chats"
      >
        <MessageTime size={14} />
      </Button>

      {isOpen && selectedDatabase && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Thread List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoadingThreads ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              ) : threads.length > 0 ? (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => onThreadSwitch(thread)}
                    disabled={loadingThreadId === thread.id}
                    className={`group w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left hover:bg-slate-50 transition-colors ${
                      currentThreadId === thread.id ? 'bg-indigo-50 border border-indigo-200' : ''
                    } ${loadingThreadId === thread.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {editingThreadId === thread.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onKeyDown={(e) => onTitleKeyPress(e, thread.id)}
                            onBlur={() => onTitleSave(thread.id)}
                            className="text-sm font-medium text-slate-900 bg-white border border-indigo-300 rounded px-2 py-1 flex-1 min-w-0"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <p className="text-xs font-medium text-slate-700 truncate">
                              {thread.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEditing(thread);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity"
                              title="Edit title"
                            >
                              <Edit size={12} className="text-slate-500" />
                            </button>
                          </>
                        )}
                        {loadingThreadId === thread.id && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No threads yet. Start a conversation!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 