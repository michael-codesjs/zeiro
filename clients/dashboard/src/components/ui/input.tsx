import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { forwardRef, useState } from "react";

const inputVariants = cva(
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant, 
    size, 
    state, 
    label,
    leftIcon,
    rightIcon,
    rightElement,
    error,
    helperText,
    isRequired = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const inputState = error ? "error" : state;
    const hasLeftIcon = !!leftIcon;
    const hasRightContent = !!(rightIcon || rightElement);

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
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            className={cn(
              inputVariants({ variant, size, state: inputState }),
              hasLeftIcon && "pl-10",
              hasRightContent && "pr-10",
              className
            )}
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
          
          {/* Right Icon/Element */}
          {hasRightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement ? (
                <div className="text-slate-500">
                  {rightElement}
                </div>
              ) : (
                <div className="text-slate-500 pointer-events-none">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
        
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

Input.displayName = "Input";

export { Input, inputVariants }; 