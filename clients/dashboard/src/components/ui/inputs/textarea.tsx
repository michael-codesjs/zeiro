import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { forwardRef, useState } from "react";

const textareaVariants = cva(
  "w-full border rounded-lg bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-slate-800 resize-y",
  {
    variants: {
      variant: {
        default: "border-slate-300 hover:border-slate-400",
        filled: "border-slate-200 bg-slate-50 hover:bg-white",
        outline: "border-2 border-slate-300 hover:border-slate-400",
        ghost: "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50",
      },
      size: {
        sm: "min-h-[80px] px-2 py-1 text-sm",
        md: "min-h-[100px] px-3 py-2 text-sm",
        lg: "min-h-[120px] px-4 py-3 text-base",
      },
      state: {
        default: "",
        error: "border-red-300 focus:border-red-500 focus:ring-red-500",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
      resize: "vertical",
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    variant, 
    size, 
    state, 
    resize,
    label,
    error,
    helperText,
    isRequired = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const textareaState = error ? "error" : state;

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
        
        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            textareaVariants({ variant, size, state: textareaState, resize }),
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

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants }; 