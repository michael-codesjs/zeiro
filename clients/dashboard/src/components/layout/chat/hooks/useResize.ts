import { useState, useCallback, useEffect, useRef } from 'react';
import { CHAT_CONFIG } from '../constants';

export const useResize = () => {
  const [width, setWidth] = useState(CHAT_CONFIG.DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !chatRef.current) return;
    
    const rect = chatRef.current.getBoundingClientRect();
    const newWidth = rect.right - e.clientX;
    
    if (newWidth >= CHAT_CONFIG.MIN_WIDTH && newWidth <= CHAT_CONFIG.MAX_WIDTH) {
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

  return {
    width,
    isResizing,
    resizeRef,
    chatRef,
    handleMouseDown
  };
};
