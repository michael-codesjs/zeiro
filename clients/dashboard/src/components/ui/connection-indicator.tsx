"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ConnectionIndicatorProps {
  status: 'connected' | 'connecting' | 'error' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  connected: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    label: 'Connected',
    animation: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
  },
  connecting: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    label: 'Connecting',
    animation: { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    label: 'Error',
    animation: { scale: [1, 1.1, 1] }
  },
  idle: {
    color: 'bg-gray-400',
    textColor: 'text-gray-500',
    label: 'Idle',
    animation: { opacity: [1, 0.5, 1] }
  }
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3'
};

export default function ConnectionIndicator({
  status,
  size = 'md',
  showLabel = false,
  className
}: ConnectionIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <motion.div
        className={cn("rounded-full", config.color, sizeClass)}
        animate={config.animation}
        transition={{
          duration: status === 'connecting' ? 1 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {showLabel && (
        <span className={cn("text-xs font-medium", config.textColor)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
