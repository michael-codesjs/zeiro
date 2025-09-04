import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = 'md', disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11'
    };

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    const translateClasses = {
      sm: 'translate-x-3',
      md: 'translate-x-4',
      lg: 'translate-x-5'
    };

    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              "relative inline-flex items-center rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              sizeClasses[size],
              props.checked
                ? "bg-indigo-600"
                : "bg-slate-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => {
              if (!disabled && props.onChange) {
                props.onChange({
                  target: { checked: !props.checked }
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            <span
              className={cn(
                "pointer-events-none inline-block rounded-md bg-white shadow transform ring-0 transition ease-in-out duration-200",
                thumbSizeClasses[size],
                props.checked ? translateClasses[size] : "translate-x-0"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label className="text-sm font-medium text-slate-900 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }; 