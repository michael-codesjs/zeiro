"use client";

import { ToolCall } from "@/hooks/use-chat";
import { cn } from "@/utils/cn";

interface ToolCallDisplayProps {
  toolCall: ToolCall;
  className?: string;
}

export function ToolCallDisplay({ toolCall, className }: ToolCallDisplayProps) {
  const getStatusIndicator = (status: ToolCall['status']) => {
    switch (status) {
      case 'started':
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
            <span className="text-[10px] text-gray-500">{toolCall.tool_name}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[10px] text-gray-500">{toolCall.tool_name}</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-[10px] text-gray-500">{toolCall.tool_name}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("inline-flex items-center py-1", className)}>
      {getStatusIndicator(toolCall.status)}
    </div>
  );
}

