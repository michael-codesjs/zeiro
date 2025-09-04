"use client";

import { forwardRef, useEffect } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Button } from '@/components/ui/buttons/button';

const sidePanelVariants = cva(
  "fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col",
  {
    variants: {
      size: {
        sm: "w-80",
        md: "w-96", 
        lg: "w-[28rem]",
        xl: "w-[32rem]",
        "2xl": "w-[36rem]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

// Side Panel Root Component
export interface SidePanelProps extends VariantProps<typeof sidePanelVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  ({ 
    isOpen, 
    onClose, 
    children, 
    size,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    className,
    ...props 
  }, ref) => {
    // Handle ESC key
    useEffect(() => {
      if (!closeOnEsc || !isOpen) return;

      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [closeOnEsc, isOpen, onClose]);

    // Prevent body scroll when panel is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        
        {/* Side Panel */}
        <div
          ref={ref}
          className={cn(
            sidePanelVariants({ size }), 
            isOpen ? 'translate-x-0' : 'translate-x-full',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

SidePanel.displayName = "SidePanel";

// Side Panel Header Component
export interface SidePanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidePanelHeader = forwardRef<HTMLDivElement, SidePanelHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white", className)}
      {...props}
    >
      {children}
    </div>
  )
);

SidePanelHeader.displayName = "SidePanelHeader";

// Side Panel Body Component
export interface SidePanelBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const SidePanelBody = forwardRef<HTMLDivElement, SidePanelBodyProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto px-6 py-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);

SidePanelBody.displayName = "SidePanelBody";

// Side Panel Footer Component
export interface SidePanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SidePanelFooter = forwardRef<HTMLDivElement, SidePanelFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50", className)}
      {...props}
    >
      {children}
    </div>
  )
);

SidePanelFooter.displayName = "SidePanelFooter";

// Side Panel Close Button Component
export interface SidePanelCloseButtonProps {
  className?: string;
}

export const SidePanelCloseButton = forwardRef<HTMLButtonElement, SidePanelCloseButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn("p-1.5 h-auto text-gray-400 hover:text-gray-600", className)}
      {...props}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </Button>
  )
);

SidePanelCloseButton.displayName = "SidePanelCloseButton"; 