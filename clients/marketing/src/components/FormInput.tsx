import React, { ReactNode, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Icon container variant
const iconContainerVariants = cva(
  'absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none transition-colors duration-200',
  {
    variants: {
      state: {
        error: 'text-red-400',
        focused: 'text-indigo-500',
        default: 'text-gray-400',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

// Input field variant
const inputVariants = cva(
  'w-full px-4 py-3 rounded-lg border shadow-sm outline-none transition-all duration-200 text-gray-600',
  {
    variants: {
      state: {
        error: 'border-red-400 bg-red-50/80 text-red-800 placeholder-red-300 focus:border-red-500 focus:ring-red-500/30',
        focused: 'border-indigo-500 ring-2 ring-indigo-500/20',
        default: 'border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
      },
      hasIcon: {
        true: 'pl-11',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      hasIcon: false,
    },
  }
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  id: string;
  name?: string;
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  required = false,
  autoComplete,
  icon,
  onBlur,
  hint,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine input state for styling
  const inputState = error ? 'error' : isFocused ? 'focused' : 'default';

  // Determine the actual input type based on the original type and password visibility
  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={iconContainerVariants({ state: inputState })}>
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name || id}
          type={actualType}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          className={inputVariants({ 
            state: inputState,
            hasIcon: !!icon,
            className,
          })}
          placeholder={placeholder}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        )}
        
        {error && !(type === 'password') ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        ) : value && type === 'password' && !showPassword ? (
          <div className="absolute inset-y-0 right-10 flex items-center pr-3 pointer-events-none text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500 ml-1">{hint}</p>
      ) : null}
    </div>
  );
};

export { FormInput, inputVariants, iconContainerVariants };
export default FormInput; 