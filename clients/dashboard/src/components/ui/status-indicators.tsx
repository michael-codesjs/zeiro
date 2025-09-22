"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

type StatusType = 'online' | 'offline' | 'connecting' | 'error' | 'idle' | 'busy';

interface StatusIndicatorProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    label: 'Online',
    animation: { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
  },
  offline: {
    color: 'bg-gray-400',
    label: 'Offline',
    animation: { opacity: [1, 0.5, 1] }
  },
  connecting: {
    color: 'bg-yellow-500',
    label: 'Connecting',
    animation: { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
  },
  error: {
    color: 'bg-red-500',
    label: 'Error',
    animation: { scale: [1, 1.1, 1] }
  },
  idle: {
    color: 'bg-blue-400',
    label: 'Idle',
    animation: { opacity: [1, 0.6, 1] }
  },
  busy: {
    color: 'bg-orange-500',
    label: 'Busy',
    animation: { rotate: [0, 360] }
  }
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
};

export default function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  animated = true,
  className
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  const indicator = (
    <motion.div
      className={cn(
        "rounded-full flex-shrink-0",
        config.color,
        sizeClass,
        className
      )}
      animate={animated ? config.animation : undefined}
      transition={{
        duration: status === 'connecting' ? 1 : status === 'busy' ? 2 : 2,
        repeat: animated ? Infinity : 0,
        ease: status === 'busy' ? "linear" : "easeInOut"
      }}
    />
  );

  if (!showLabel) {
    return indicator;
  }

  return (
    <div className="flex items-center space-x-2">
      {indicator}
      <span className="text-sm text-slate-600 font-medium">
        {config.label}
      </span>
    </div>
  );
}

// Compound component for multiple status indicators
export function StatusGroup({ 
  statuses, 
  className 
}: { 
  statuses: Array<{ id: string; status: StatusType; label?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {statuses.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          <StatusIndicator status={item.status} size="sm" />
          {item.label && (
            <span className="text-xs text-slate-500">{item.label}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
