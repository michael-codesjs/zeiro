"use client";

import { forwardRef, useEffect } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Button } from '@/components/ui/buttons/button';

const modalVariants = cva(
  "relative bg-white rounded-2xl shadow-xl",
  {
    variants: {
      size: {
        xs: "max-w-xs w-full",
        sm: "max-w-sm w-full",
        md: "max-w-md w-full",
        lg: "max-w-lg w-full",
        xl: "max-w-xl w-full",
        "2xl": "max-w-2xl w-full",
        "3xl": "max-w-3xl w-full",
        "4xl": "max-w-4xl w-full",
        "5xl": "max-w-5xl w-full",
        "6xl": "max-w-6xl w-full",
        full: "w-full h-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Modal Root Component
export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
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

    // Prevent body scroll when modal is open
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
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-all duration-300"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        
        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={ref}
            className={cn(modalVariants({ size }), className)}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

// Modal Header Component
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-6 border-b border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalHeader.displayName = "ModalHeader";

// Modal Body Component
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalBody.displayName = "ModalBody";

// Modal Footer Component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end space-x-3 p-6 border-t border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalFooter.displayName = "ModalFooter";

// Modal Close Button Component
export interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  ({ onClose, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={onClose}
      className={cn("p-2 h-auto", className)}
      {...props}
    >
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </Button>
  )
);

ModalCloseButton.displayName = "ModalCloseButton";

// Modal Content Wrapper (optional, for semantic grouping)
export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

ModalContent.displayName = "ModalContent"; 