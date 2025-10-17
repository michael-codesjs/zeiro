"use client";

import { ToolCall } from "@/hooks/use-chat";
import { cn } from "@/utils/cn";
import { 
  SearchNormal1, 
  Code, 
  Play,
  TickCircle,
  CloseCircle,
  Refresh,
  Setting2
} from "iconsax-reactjs";

interface ToolCallDisplayProps {
  toolCall: ToolCall;
  className?: string;
}

export function ToolCallDisplay({ toolCall, className }: ToolCallDisplayProps) {
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'query_generation':
        return <Code size={16} />;
      case 'query_execution':
        return <Play size={16} />;
      case 'data_source_introspection':
        return <Setting2 size={16} />;
      default:
        return <Code size={16} />;
    }
  };

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'started':
        return <Refresh size={14} className="animate-spin text-blue-500" />;
      case 'completed':
        return <TickCircle size={14} className="text-green-500" />;
      case 'failed':
        return <CloseCircle size={14} className="text-red-500" />;
    }
  };


  return (
    <div className={cn("flex items-center gap-2 mb-1", className)}>
      <span className="font-bold text-sm text-gray-400">{toolCall.tool_name}</span>
      {getStatusIcon(toolCall.status)}
    </div>
  );
}

