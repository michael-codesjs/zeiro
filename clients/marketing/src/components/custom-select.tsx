'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDown2, TickCircle } from 'iconsax-react';

const selectVariants = cva(
  'w-full transition-all duration-200 focus:outline-none relative cursor-pointer',
  {
    variants: {
      variant: {
        default: [
          'rounded-lg bg-gray-900/90 border border-gray-800',
          'text-foreground hover:border-gray-700 hover:bg-gray-900',
          'focus:border-gray-600 focus:bg-gray-900',
        ],
        clean: [
          'rounded-md bg-gray-800/80 border border-gray-700/50',
          'text-foreground hover:border-gray-600 hover:bg-gray-800/90',
          'focus:border-white/60 focus:bg-gray-800',
        ],
        modern: [
          'rounded-xl bg-white/5 border border-white/10',
          'text-foreground hover:bg-white/10 hover:border-white/20',
          'focus:bg-white/15 focus:border-white/30',
          'backdrop-blur-sm'
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
        error: 'border-red-500/60 bg-red-950/10',
        success: 'border-green-500/60 bg-green-950/10',
        disabled: 'opacity-50 cursor-not-allowed border-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

const popoverVariants = cva(
  'absolute z-50 w-full mt-2 rounded-xl border shadow-2xl transition-all duration-200 origin-top',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 border-gray-800 shadow-black/50',
        clean: 'bg-gray-800 border-gray-700 shadow-black/40',
        modern: 'bg-gray-900 border-gray-700 shadow-black/30',
      },
      state: {
        open: 'opacity-100 scale-100 translate-y-0',
        closed: 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'closed',
    },
  }
);

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
  VariantProps<typeof selectVariants> {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  labelVariant?: 'default' | 'bold' | 'subtle' | 'floating';
}

const CustomSelect = forwardRef<HTMLDivElement, CustomSelectProps>(({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  variant,
  size,
  state,
  labelVariant = 'default',
  className,
  name,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectState = error ? 'error' : disabled ? 'disabled' : state || 'default';
  const selectedOption = options.find(option => option.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const labelVariants = cva(
    'block font-medium mb-3 transition-all duration-200',
    {
      variants: {
        variant: {
          default: 'text-muted-foreground',
          bold: 'text-foreground font-semibold',
          subtle: 'text-muted-foreground',
          floating: 'text-gray-500',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    }
  );

  return (
    <div className={`group relative ${className}`} ref={selectRef} {...props}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value || ''} />
      
      {label && (
        <label className={labelVariants({ variant: labelVariant })}>
          {label}
          {required && (
            <span className="text-red-400 ml-1">*</span>
          )}
        </label>
      )}

      {/* Select Trigger */}
      <div
        ref={ref}
        className={selectVariants({ variant, size, state: selectState, className: 'flex items-center justify-between' })}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-foreground' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ArrowDown2 
          size={16}
          color="currentColor"
          variant="Outline"
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Popover */}
      <div className={popoverVariants({ 
        variant, 
        state: isOpen ? 'open' : 'closed' 
      })}>
        {/* Search Input */}
        <div className="p-3 border-b border-gray-700/50">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-foreground placeholder-gray-400 text-sm focus:outline-none transition-colors ${
              variant === 'clean' 
                ? 'bg-gray-800 border-gray-700 focus:border-gray-600 focus:bg-gray-800' 
                : variant === 'modern'
                ? 'bg-gray-900 border-gray-700 focus:border-gray-600 focus:bg-gray-900'
                : 'bg-gray-900 border-gray-800 focus:border-gray-600 focus:bg-gray-900'
            }`}
          />
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto py-2">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-muted-foreground text-sm">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between
                  ${option.disabled 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-foreground hover:bg-white/10'
                  }
                  ${value === option.value ? 'bg-white/5' : ''}
                `}
                onClick={() => !option.disabled && handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="text-sm">{option.label}</span>
                {value === option.value && (
                  <TickCircle size={16} color="white" variant="Bold" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';

export { CustomSelect, selectVariants };
export default CustomSelect;
