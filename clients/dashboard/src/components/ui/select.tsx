"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { forwardRef, useState, useRef, useEffect } from "react";

const selectVariants = cva(
  "w-full border rounded-lg bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none font-medium antialiased",
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

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface SelectProps extends VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    options = [],
    value,
    onValueChange,
    placeholder = "Select option...",
    label,
    error,
    helperText,
    isRequired = false,
    loading = false,
    emptyMessage = "No options available",
    searchable = false,
    className,
    disabled = false,
    variant,
    size,
    state,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const selectState = error ? "error" : state;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected option for display
    const selectedOption = options.find(option => option.value === value);

    const handleSelect = (optionValue: string) => {
      onValueChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            className={cn(
              "block text-sm font-medium text-slate-700 mb-2",
              error && "text-red-600",
              isRequired && "after:content-['*'] after:ml-1 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Select Container */}
        <div ref={containerRef} className="relative">
          <div ref={ref} {...props}>
            {/* Select Trigger */}
            <button
              type="button"
              onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
              disabled={disabled || loading}
              className={cn(
                selectVariants({ variant, size, state: selectState }),
                "cursor-pointer text-left flex items-center justify-between",
                (disabled || loading) && "cursor-not-allowed",
                isOpen && "ring-2 ring-indigo-500 border-indigo-500",
                className
              )}
            >
              <span className="flex items-center space-x-2 flex-1 min-w-0">
                {selectedOption?.leftIcon && (
                  <span className="flex-shrink-0">{selectedOption.leftIcon}</span>
                )}
                <span className={cn(
                  "truncate",
                  !selectedOption && "text-slate-500"
                )}>
                  {loading ? "Loading..." : selectedOption?.label || placeholder}
                </span>
              </span>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                {selectedOption?.rightIcon && (
                  <span>{selectedOption.rightIcon}</span>
                )}
                {loading ? (
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg 
                    className={cn(
                      "w-4 h-4 transform transition-transform duration-200 text-slate-400",
                      isOpen && "rotate-180"
                    )}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Dropdown */}
            {isOpen && !loading && (
              <div className="absolute z-50 min-w-full w-max max-w-2xl mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                {searchable && (
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-500"
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500 text-center">
                      {searchTerm ? "No results found" : emptyMessage}
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus:bg-slate-50 transition-colors flex items-center space-x-3 min-w-0",
                          option.disabled && "opacity-50 cursor-not-allowed",
                          value === option.value && "bg-indigo-50 text-indigo-900"
                        )}
                      >
                        {option.leftIcon && (
                          <span className="flex-shrink-0">{option.leftIcon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-medium text-slate-900 whitespace-nowrap">
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-sm text-slate-500 whitespace-nowrap">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {option.rightIcon && (
                          <span className="flex-shrink-0">{option.rightIcon}</span>
                        )}
                        {value === option.value && (
                          <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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

Select.displayName = "Select";

export { Select, selectVariants };
export type { SelectProps }; 