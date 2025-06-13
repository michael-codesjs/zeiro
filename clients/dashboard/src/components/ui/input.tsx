import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { forwardRef } from "react";

const inputVariants = cva(
  // Base styles
  "flex w-full rounded-lg border transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
        filled: "border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
        ghost: "border-transparent bg-transparent focus:border-slate-200 focus:bg-white",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
      state: {
        default: "",
        error: "border-red-300 focus:border-red-500 focus:ring-red-500/20",
        success: "border-green-300 focus:border-green-500 focus:ring-green-500/20",
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
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    leftIcon, 
    rightIcon, 
    error,
    helperText,
    ...props 
  }, ref) => {
    const inputState = error ? "error" : state;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-slate-400 text-sm">
                {leftIcon}
              </div>
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant, size, state: inputState }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-slate-400 text-sm">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
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