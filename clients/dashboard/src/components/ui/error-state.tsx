"use client";

import { Button } from "./buttons/button";
import { Setting2 } from "iconsax-reactjs";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  retryText?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content.",
  icon,
  onRetry,
  retryText = "Try Again",
  variant = 'default',
  className = ""
}: ErrorStateProps) {
  const isCompact = variant === 'compact';
  
  const defaultIcon = (
    <Setting2 size={isCompact ? "20" : "24"} className={isCompact ? "text-red-500" : "text-red-500"} />
  );

  if (isCompact) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className={`w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
          {icon || defaultIcon}
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
          {message}
        </p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="primary" 
          size="sm" 
          onClick={onRetry}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}
