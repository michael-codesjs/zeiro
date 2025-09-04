"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { forwardRef, useState, useRef, useEffect } from "react";

const pinInputVariants = cva(
  "w-12 h-12 text-center border rounded-lg bg-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-slate-300 hover:border-slate-400",
        filled: "border-slate-200 bg-slate-50 hover:bg-white",
        outline: "border-2 border-slate-300 hover:border-slate-400",
      },
      size: {
        sm: "w-8 h-8 text-sm",
        md: "w-12 h-12 text-lg",
        lg: "w-16 h-16 text-xl",
      },
      state: {
        default: "",
        error: "border-red-300 focus:border-red-500 focus:ring-red-500",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500",
        filled: "border-indigo-500 bg-indigo-50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

export interface PinInputProps extends VariantProps<typeof pinInputVariants> {
  length?: number;
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  mask?: boolean;
  placeholder?: string;
  onComplete?: (value: string) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: 'number' | 'alphanumeric';
}

const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  ({
    length = 6,
    label,
    error,
    helperText,
    isRequired = false,
    mask = false,
    placeholder = "○",
    onComplete,
    onValueChange,
    className,
    disabled = false,
    autoFocus = false,
    type = 'number',
    variant,
    size,
    state,
  }, ref) => {
    const [values, setValues] = useState<string[]>(new Array(length).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const inputState = error ? "error" : state;

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const isValidInput = (value: string) => {
      if (type === 'number') {
        return /^\d$/.test(value);
      }
      return /^[a-zA-Z0-9]$/.test(value);
    };

    const handleInputChange = (index: number, value: string) => {
      if (value && !isValidInput(value)) return;

      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      const currentValue = newValues.join('');
      onValueChange?.(currentValue);

      if (value && index < length - 1) {
        // Move to next input
        inputRefs.current[index + 1]?.focus();
      }

      if (currentValue.length === length) {
        onComplete?.(currentValue);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newValues = [...values];
        
        if (values[index]) {
          // Clear current input
          newValues[index] = '';
          setValues(newValues);
        } else if (index > 0) {
          // Move to previous input and clear it
          newValues[index - 1] = '';
          setValues(newValues);
          inputRefs.current[index - 1]?.focus();
        }
        
        onValueChange?.(newValues.join(''));
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
        onValueChange?.(newValues.join(''));
      }
    };

    const handleFocus = (index: number) => {
      setFocusedIndex(index);
    };

    const handleBlur = () => {
      setFocusedIndex(-1);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const pastedChars = pastedData.slice(0, length).split('');
      
      const newValues = new Array(length).fill('');
      pastedChars.forEach((char, index) => {
        if (index < length && isValidInput(char)) {
          newValues[index] = char;
        }
      });
      
      setValues(newValues);
      onValueChange?.(newValues.join(''));
      
      if (newValues.join('').length === length) {
        onComplete?.(newValues.join(''));
      }
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newValues.findIndex(val => !val);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();
    };

    const getInputState = (index: number) => {
      if (inputState === 'error') return 'error';
      if (values[index]) return 'filled';
      return inputState;
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className={cn(
            "block text-sm font-medium text-slate-700 mb-3",
            error && "text-red-600",
            isRequired && "after:content-['*'] after:ml-1 after:text-red-500"
          )}>
            {label}
          </label>
        )}
        
        {/* Pin Input Container */}
        <div 
          ref={ref}
          className={cn("flex items-center justify-center space-x-2", className)}
        >
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type={mask ? 'password' : 'text'}
              inputMode={type === 'number' ? 'numeric' : 'text'}
              className={cn(
                pinInputVariants({ 
                  variant, 
                  size, 
                  state: getInputState(index) 
                }),
                focusedIndex === index && "ring-2 ring-indigo-500 border-indigo-500 scale-105"
              )}
              value={mask && values[index] ? '•' : values[index]}
              placeholder={placeholder}
              maxLength={1}
              disabled={disabled}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              onPaste={index === 0 ? handlePaste : undefined}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mt-3 flex justify-center">
          <div className="flex space-x-1">
            {Array.from({ length }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-1 rounded-full transition-colors",
                  values[index] ? "bg-indigo-500" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p className={cn(
            "mt-2 text-xs text-center",
            error ? "text-red-600" : "text-slate-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

PinInput.displayName = "PinInput";

export { PinInput };
