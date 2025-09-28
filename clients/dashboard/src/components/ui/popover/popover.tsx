"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  alignOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Popover({
  trigger,
  children,
  className,
  contentClassName,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleToggle = () => {
    const newOpen = !isOpen;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const getContentPosition = () => {
    const positions: Record<string, string> = {
      'bottom-start': 'top-full left-0',
      'bottom-center': 'top-full left-1/2 -translate-x-1/2',
      'bottom-end': 'top-full right-0',
      'top-start': 'bottom-full left-0',
      'top-center': 'bottom-full left-1/2 -translate-x-1/2',
      'top-end': 'bottom-full right-0',
      'left-start': 'right-full top-0',
      'left-center': 'right-full top-1/2 -translate-y-1/2',
      'left-end': 'right-full bottom-0',
      'right-start': 'left-full top-0',
      'right-center': 'left-full top-1/2 -translate-y-1/2',
      'right-end': 'left-full bottom-0',
    };
    
    return positions[`${side}-${align}`] || positions['bottom-center'];
  };

  const getMargin = () => {
    const margins: Record<string, string> = {
      top: `mb-${sideOffset}`,
      bottom: `mt-${sideOffset}`,
      left: `mr-${sideOffset}`,
      right: `ml-${sideOffset}`,
    };
    
    return margins[side] || 'mt-1';
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: side === 'top' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === 'top' ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cn(
              "absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg",
              getContentPosition(),
              getMargin(),
              contentClassName
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
