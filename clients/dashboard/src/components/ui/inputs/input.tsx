"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { forwardRef, useState, useEffect } from "react";

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
      inputType: {
        text: "",
        password: "",
        number: "",
        search: "",
        email: "",
        tel: "",
        url: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
      inputType: "text",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  
  // Password specific
  showPasswordToggle?: boolean;
  showStrengthIndicator?: boolean;
  
  // Number specific
  showStepper?: boolean;
  precision?: number;
  formatOptions?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  onValueChange?: (value: number | null) => void;
  
  // Search specific
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  debounceMs?: number;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant, 
    size, 
    state,
    inputType = "text",
    label,
    leftIcon,
    rightIcon,
    rightElement,
    error,
    helperText,
    isRequired = false,
    
    // Password specific
    showPasswordToggle = true,
    showStrengthIndicator = false,
    
    // Number specific
    showStepper = true,
    precision = 0,
    formatOptions,
    prefix,
    suffix,
    onValueChange,
    
    // Search specific
    onSearch,
    onClear,
    showClearButton = true,
    debounceMs = 300,
    loading = false,
    suggestions = [],
    onSuggestionSelect,
    
    value,
    onChange,
    min,
    max,
    step = 1,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [displayValue, setDisplayValue] = useState(value?.toString() || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const inputState = error ? "error" : state;
    const isPassword = inputType === "password";
    const isNumber = inputType === "number";
    const isSearch = inputType === "search";
    
    // Debounced search effect
    useEffect(() => {
      if (!onSearch || !isSearch) return;
      
      const timer = setTimeout(() => {
        if (displayValue !== value) {
          onSearch(displayValue);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [displayValue, debounceMs, onSearch, value, isSearch]);

    // Password strength calculation
    const calculateStrength = (password: string) => {
      let score = 0;
      if (password.length >= 8) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
      return score;
    };

    const getStrengthLabel = (score: number) => {
      if (score === 0) return { label: '', color: '' };
      if (score <= 2) return { label: 'Weak', color: 'text-red-600' };
      if (score <= 3) return { label: 'Fair', color: 'text-yellow-600' };
      if (score <= 4) return { label: 'Good', color: 'text-blue-600' };
      return { label: 'Strong', color: 'text-green-600' };
    };

    const getStrengthColor = (score: number) => {
      if (score <= 2) return 'bg-red-500';
      if (score <= 3) return 'bg-yellow-500';
      if (score <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    };

    // Number formatting functions
    const formatNumber = (num: number) => {
      if (formatOptions) {
        return new Intl.NumberFormat(undefined, formatOptions).format(num);
      }
      return precision > 0 ? num.toFixed(precision) : num.toString();
    };

    const parseNumber = (str: string) => {
      let cleanStr = str;
      if (prefix) cleanStr = cleanStr.replace(prefix, '');
      if (suffix) cleanStr = cleanStr.replace(suffix, '');
      cleanStr = cleanStr.replace(/,/g, '');
      
      const num = parseFloat(cleanStr);
      return isNaN(num) ? null : num;
    };

    // Event handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      if (isNumber) {
        setDisplayValue(inputValue);
        const numericValue = parseNumber(inputValue);
        onValueChange?.(numericValue);
      } else if (isSearch) {
        setDisplayValue(inputValue);
        if (suggestions.length > 0) {
          setShowSuggestions(inputValue.length > 0);
        }
      } else {
        setDisplayValue(inputValue);
      }
      
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      if (isNumber) {
        const numericValue = parseNumber(displayValue);
        if (numericValue !== null) {
          let constrainedValue = numericValue;
          if (min !== undefined && constrainedValue < Number(min)) {
            constrainedValue = Number(min);
          }
          if (max !== undefined && constrainedValue > Number(max)) {
            constrainedValue = Number(max);
          }
          
          const formattedValue = formatNumber(constrainedValue);
          const finalValue = `${prefix || ''}${formattedValue}${suffix || ''}`;
          setDisplayValue(finalValue);
          
          if (constrainedValue !== numericValue) {
            onValueChange?.(constrainedValue);
          }
        }
      } else if (isSearch) {
        setTimeout(() => setShowSuggestions(false), 200);
      }
      
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      if (isNumber) {
        const numericValue = parseNumber(displayValue);
        if (numericValue !== null) {
          setDisplayValue(numericValue.toString());
        }
      } else if (isSearch && suggestions.length > 0 && displayValue.length > 0) {
        setShowSuggestions(true);
      }
      
      props.onFocus?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isSearch && e.key === 'Escape') {
        setShowSuggestions(false);
      }
      props.onKeyDown?.(e);
    };

    // Helper functions
    const handleStepUp = () => {
      if (!isNumber) return;
      const currentValue = parseNumber(displayValue) || 0;
      const newValue = currentValue + Number(step);
      const constrainedValue = max !== undefined ? Math.min(newValue, Number(max)) : newValue;
      
      setDisplayValue(constrainedValue.toString());
      onValueChange?.(constrainedValue);
    };

    const handleStepDown = () => {
      if (!isNumber) return;
      const currentValue = parseNumber(displayValue) || 0;
      const newValue = currentValue - Number(step);
      const constrainedValue = min !== undefined ? Math.max(newValue, Number(min)) : newValue;
      
      setDisplayValue(constrainedValue.toString());
      onValueChange?.(constrainedValue);
    };

    const handleClear = () => {
      if (!isSearch) return;
      setDisplayValue('');
      setShowSuggestions(false);
      onClear?.();
      
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    const handleSuggestionClick = (suggestion: string) => {
      setDisplayValue(suggestion);
      setShowSuggestions(false);
      onSuggestionSelect?.(suggestion);
      
      const syntheticEvent = {
        target: { value: suggestion },
        currentTarget: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    // Computed values
    const hasLeftIcon = !!leftIcon || (isSearch && !loading);
    const hasRightContent = !!(rightIcon || rightElement) || 
                           (isPassword && showPasswordToggle) || 
                           (isNumber && showStepper) ||
                           (isSearch && showClearButton && displayValue.length > 0);
    
    const passwordValue = isPassword ? displayValue : '';
    const strength = isPassword ? calculateStrength(passwordValue) : 0;
    const strengthInfo = isPassword ? getStrengthLabel(strength) : { label: '', color: '' };
    
    const filteredSuggestions = isSearch ? suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(displayValue.toLowerCase())
    ) : [];

    // Get input type
    const getInputType = () => {
      if (isPassword) return isPasswordVisible ? "text" : "password";
      if (isNumber) return "text";
      return inputType;
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
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon || (isSearch && (
                loading ? (
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              ))}
            </div>
          )}
          
          {/* Prefix */}
          {isNumber && prefix && !isFocused && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {prefix}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={getInputType()}
            inputMode={isNumber ? "numeric" : undefined}
            className={cn(
              inputVariants({ variant, size, state: inputState, inputType }),
              hasLeftIcon && "pl-10",
              (isNumber && prefix && !isFocused) && "pl-8",
              (isNumber && suffix && !isFocused) && "pr-8",
              hasRightContent && "pr-10",
              (isNumber && showStepper) && "pr-12",
              className
            )}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            min={isNumber ? min : undefined}
            max={isNumber ? max : undefined}
            step={isNumber ? step : undefined}
            {...props}
          />
          
          {/* Suffix */}
          {isNumber && suffix && !isFocused && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {suffix}
            </div>
          )}
          
          {/* Right Content */}
          {hasRightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {/* Password Toggle */}
              {isPassword && showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isPasswordVisible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Number Stepper */}
              {isNumber && showStepper && (
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={handleStepUp}
                    className="px-1 py-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleStepDown}
                    className="px-1 py-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Search Clear Button */}
              {isSearch && showClearButton && displayValue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Custom Right Content */}
              {rightElement && (
                <div className="text-slate-500">
                  {rightElement}
                </div>
              )}
              {rightIcon && !rightElement && (
                <div className="text-slate-500 pointer-events-none">
                  {rightIcon}
                </div>
              )}
            </div>
          )}

          {/* Search Suggestions Dropdown */}
          {isSearch && showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 focus:outline-none focus:bg-slate-50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1 truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Password Strength Indicator */}
        {isPassword && showStrengthIndicator && passwordValue && (
          <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    level <= strength ? getStrengthColor(strength) : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            
            {/* Strength Label */}
            {strengthInfo.label && (
              <p className={cn("text-xs font-medium", strengthInfo.color)}>
                Password strength: {strengthInfo.label}
              </p>
            )}

            {/* Requirements */}
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  passwordValue.length >= 8 ? "bg-green-500" : "bg-slate-300"
                )}>
                </div>
                <span className={passwordValue.length >= 8 ? "text-green-600" : ""}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  /[A-Z]/.test(passwordValue) ? "bg-green-500" : "bg-slate-300"
                )}>
                </div>
                <span className={/[A-Z]/.test(passwordValue) ? "text-green-600" : ""}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  /[0-9]/.test(passwordValue) ? "bg-green-500" : "bg-slate-300"
                )}>
                </div>
                <span className={/[0-9]/.test(passwordValue) ? "text-green-600" : ""}>
                  One number
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  /[^A-Za-z0-9]/.test(passwordValue) ? "bg-green-500" : "bg-slate-300"
                )}>
                </div>
                <span className={/[^A-Za-z0-9]/.test(passwordValue) ? "text-green-600" : ""}>
                  One special character
                </span>
              </div>
            </div>
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

Input.displayName = "Input";

export { Input, inputVariants }; 