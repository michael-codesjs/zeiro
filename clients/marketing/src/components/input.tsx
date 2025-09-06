import React, { forwardRef, ReactNode, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeSlash } from 'iconsax-react';

const inputVariants = cva(
  // Enhanced input styling with smooth animations
  'w-full transition-all duration-300 focus:outline-none relative group-hover:scale-[1.01] focus:scale-[1.01]',
  {
    variants: {
      variant: {
        default: [
          'rounded-lg bg-gray-900/90 border border-gray-800',
          'text-white placeholder-gray-400',
          'hover:border-gray-700 hover:bg-gray-900 hover:shadow-lg hover:shadow-black/20',
          'focus:border-gray-600 focus:bg-gray-900 focus:shadow-xl focus:shadow-black/30',
        ],
        clean: [
          'rounded-md bg-gray-800/80 border border-gray-700/50',
          'text-white placeholder-gray-500',
          'hover:border-gray-600 hover:bg-gray-800/90 hover:shadow-md hover:shadow-black/10',
          'focus:border-white/60 focus:bg-gray-800 focus:shadow-lg focus:shadow-white/5',
        ],
        minimal: [
          'rounded-md bg-gray-900/60 border-b-2 border-gray-700',
          'text-white placeholder-gray-400',
          'hover:border-gray-600 hover:bg-gray-900/80',
          'focus:border-white focus:bg-gray-900/90',
          'rounded-b-none'
        ],
        modern: [
          'rounded-xl bg-white/5 border border-white/10',
          'text-white placeholder-gray-400',
          'hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5',
          'focus:bg-white/15 focus:border-white/30 focus:shadow-xl focus:shadow-white/10',
          'backdrop-blur-sm'
        ],
        floating: [
          'rounded-lg bg-transparent border-2 border-gray-700',
          'text-white placeholder-transparent',
          'hover:border-gray-600 hover:bg-gray-900/20',
          'focus:border-white focus:bg-gray-900/30',
          'peer'
        ],
        password: [
          'rounded-xl bg-white/5 border border-white/10',
          'text-white placeholder-gray-400',
          'hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5',
          'focus:bg-white/15 focus:border-white/30 focus:shadow-xl focus:shadow-white/10',
          'backdrop-blur-sm pr-12'
        ],
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-4 py-2.5 text-sm min-h-[40px]',
        lg: 'px-4 py-3 text-base min-h-[44px]',
        xl: 'px-5 py-3.5 text-base min-h-[48px]',
      },
      state: {
        default: '',
        error: [
          'border-red-500/60 bg-red-950/10',
          'text-red-100 placeholder-red-400',
          'focus:border-red-400'
        ],
        success: [
          'border-green-500/60 bg-green-950/10',
          'text-green-100 placeholder-green-400',
          'focus:border-green-400'
        ],
        disabled: 'opacity-50 cursor-not-allowed border-gray-800',
      },
    },
    compoundVariants: [
      {
        variant: 'minimal',
        state: 'error',
        class: 'border-red-500',
      },
      {
        variant: 'minimal',
        state: 'success',
        class: 'border-green-500',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

const labelVariants = cva(
  'block font-medium mb-3 transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
      variant: {
        default: 'text-gray-300',
        bold: 'text-white font-semibold',
        subtle: 'text-gray-400',
        floating: 'text-gray-500',
      },
      required: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      required: false,
    },
  }
);

interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  labelVariant?: 'default' | 'bold' | 'subtle' | 'floating';
  showSuccessState?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant,
  size,
  state,
  required = false,
  disabled = false,
  className,
  containerClassName,
  labelVariant = 'default',
  showSuccessState = false,
  id,
  type,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputState = error ? 'error' : showSuccessState ? 'success' : disabled ? 'disabled' : state || 'default';
  const isFloating = variant === 'floating';
  const isPassword = variant === 'password' || type === 'password';
  
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`group relative ${containerClassName}`}>
      {label && !isFloating && (
        <label 
          htmlFor={inputId}
          className={labelVariants({ size, variant: labelVariant })}
        >
          {label}
          {required && (
            <span className="text-red-400 ml-1 animate-pulse">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
            <div className="text-gray-500 group-focus-within:text-gray-300 transition-colors duration-200">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          disabled={disabled}
          className={inputVariants({
            variant,
            size,
            state: inputState,
            className: `${leftIcon ? 'pl-12' : ''} ${rightIcon || isPassword ? 'pr-12' : ''} ${className}`,
          })}
          {...props}
        />

        {/* Floating Label */}
        {label && isFloating && (
          <label
            htmlFor={inputId}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200 pointer-events-none
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                       peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-white
                       peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 z-10 text-gray-500 hover:text-gray-300 transition-colors duration-200"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlash size={20} color="currentColor" variant="Outline" />
            ) : (
              <Eye size={20} color="currentColor" variant="Outline" />
            )}
          </button>
        )}

        {rightIcon && !isPassword && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10">
            <div className="text-gray-500 group-focus-within:text-gray-300 transition-colors duration-200">
              {rightIcon}
            </div>
          </div>
        )}

        {/* Success indicator */}
        {showSuccessState && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
            <div className="text-green-400 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Select component variant
interface SelectProps 
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  labelVariant?: 'default' | 'bold' | 'subtle' | 'floating';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  variant,
  size,
  state,
  required = false,
  disabled = false,
  className,
  containerClassName,
  labelVariant = 'default',
  id,
  options,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const selectState = error ? 'error' : disabled ? 'disabled' : state || 'default';

  return (
    <div className={`group ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className={labelVariants({ size, variant: labelVariant })}
        >
          {label}
          {required && (
            <span className="text-red-400 ml-1 animate-pulse">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`${inputVariants({
            variant,
            size,
            state: selectState,
            className,
          })} appearance-none pr-12 cursor-pointer`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-gray-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Enhanced dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10">
          <div className="text-gray-500 group-focus-within:text-gray-300 group-hover:text-gray-400 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-focus-within:rotate-180 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Input, Select, inputVariants, labelVariants };
export default Input;
