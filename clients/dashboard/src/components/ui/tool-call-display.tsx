"use client";

import { ToolCall } from "@/hooks/use-chat";
import { cn } from "@/utils/cn";

interface ToolCallDisplayProps {
  toolCall: ToolCall;
  className?: string;
}

export function ToolCallDisplay({ toolCall, className }: ToolCallDisplayProps) {
  const getToolAction = (toolName: string) => {
    switch (toolName) {
      case 'Explore Data Source':
        return 'Exploring data structure';
      case 'Generate Query':
        return 'Writing SQL query';
      case 'Execute Query':
        return 'Running query';
      default:
        return toolName;
    }
  };

  const getStatusIndicator = (status: ToolCall['status']) => {
    switch (status) {
      case 'started':
        return (
          <div className="flex items-center gap-2 py-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
            <span className="text-xs text-gray-600 italic">{getToolAction(toolCall.tool_name)}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 py-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500">{getToolAction(toolCall.tool_name)}</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 py-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-xs text-gray-500 line-through">{getToolAction(toolCall.tool_name)}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("block", className)}>
      {getStatusIndicator(toolCall.status)}
    </div>
  );
}

