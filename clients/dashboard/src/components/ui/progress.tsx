"use client";

import { forwardRef } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const progressVariants = cva(
  "w-full bg-slate-200 rounded-full overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressBarVariants = cva(
  "h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
);

export interface ProgressProps extends VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({
    value,
    max = 100,
    size,
    className,
    showLabel = false,
    label,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="w-full">
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              {label || "Progress"}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <div
            className={progressBarVariants()}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

// Step Progress variant - specifically for wizards/steppers
export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSteps?: boolean;
}

export const StepProgress = forwardRef<HTMLDivElement, StepProgressProps>(
  ({
    currentStep,
    totalSteps,
    className,
    size = 'md',
    showSteps = true,
    ...props
  }, ref) => {
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
      <div className="w-full">
        {showSteps && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-slate-500">
              {Math.round(percentage)}% complete
            </span>
          </div>
        )}
        
        <Progress
          ref={ref}
          value={percentage}
          size={size}
          className={className}
          {...props}
        />
      </div>
    );
  }
);

StepProgress.displayName = "StepProgress"; 