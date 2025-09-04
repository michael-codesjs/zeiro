"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { forwardRef, useState } from "react";

const dateInputVariants = cva(
  "w-full border rounded-lg bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-slate-800",
  {
    variants: {
      variant: {
        default: "border-slate-300 hover:border-slate-400",
        filled: "border-slate-200 bg-slate-50 hover:bg-white",
        outline: "border-2 border-slate-300 hover:border-slate-400",
        ghost: "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-2 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
      state: {
        default: "",
        error: "border-red-300 focus:border-red-500 focus:ring-red-500",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof dateInputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  dateFormat?: 'date' | 'datetime-local' | 'time' | 'month' | 'week';
  showCalendarIcon?: boolean;
  onDateChange?: (date: Date | null) => void;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({
    className,
    variant,
    size,
    state,
    label,
    error,
    helperText,
    isRequired = false,
    dateFormat = 'date',
    showCalendarIcon = true,
    onDateChange,
    value,
    onChange,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const inputState = error ? "error" : state;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      
      if (onDateChange) {
        const date = dateValue ? new Date(dateValue) : null;
        onDateChange(date);
      }
      
      onChange?.(e);
    };

    const getPlaceholderText = () => {
      switch (dateFormat) {
        case 'date':
          return 'Select date';
        case 'datetime-local':
          return 'Select date and time';
        case 'time':
          return 'Select time';
        case 'month':
          return 'Select month';
        case 'week':
          return 'Select week';
        default:
          return 'Select date';
      }
    };

    const getCalendarIcon = () => {
      if (dateFormat === 'time') {
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }
      
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    };

    const formatDisplayValue = (inputValue: string | number | readonly string[] | undefined) => {
      if (!inputValue) return '';
      
      const dateValue = new Date(inputValue.toString());
      if (isNaN(dateValue.getTime())) return inputValue;
      
      switch (dateFormat) {
        case 'date':
          return dateValue.toLocaleDateString();
        case 'datetime-local':
          return dateValue.toLocaleString();
        case 'time':
          return dateValue.toLocaleTimeString();
        case 'month':
          return dateValue.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        case 'week':
          return `Week of ${dateValue.toLocaleDateString()}`;
        default:
          return inputValue;
      }
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={props.id}
            className={cn(
              "block text-sm font-medium text-slate-700 mb-2",
              error && "text-red-600",
              isRequired && "after:content-['*'] after:ml-1 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Calendar Icon */}
          {showCalendarIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {getCalendarIcon()}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={dateFormat}
            className={cn(
              dateInputVariants({ variant, size, state: inputState }),
              showCalendarIcon && "pl-10",
              className
            )}
            placeholder={getPlaceholderText()}
            value={value}
            onChange={handleInputChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>

        {/* Display formatted value when not focused */}
        {!isFocused && value && (
          <div className="mt-1 text-xs text-slate-500">
            {formatDisplayValue(value)}
          </div>
        )}
        
        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-red-600" : "text-slate-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };
