'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDown2, TickCircle, SearchNormal1 } from 'iconsax-react';

const selectTriggerVariants = cva(
  'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left bg-input border border-border rounded-lg text-foreground cursor-pointer transition-all duration-300 focus:outline-none focus:border-ring focus:bg-background hover:border-border/80 hover:bg-accent/50 group-hover:scale-[1.01] focus:scale-[1.01]',
  {
    variants: {
      variant: {
        default: 'bg-input border-border',
        clean: 'bg-card border-border hover:border-border/80 hover:bg-accent/50 focus:border-ring focus:bg-background',
        modern: 'bg-input border-border hover:bg-accent/50 hover:border-border/80 focus:bg-background focus:border-ring',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-4 py-2.5 text-sm min-h-[40px]',
        lg: 'px-4 py-3 text-base min-h-[44px]',
        xl: 'px-5 py-3.5 text-base min-h-[48px]',
      },
      state: {
        default: '',
        error: 'border-destructive/60 bg-destructive/10 text-destructive focus:border-destructive',
        success: 'border-success/60 bg-success/10 text-success focus:border-success',
        disabled: 'opacity-50 cursor-not-allowed border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

const dropdownVariants = cva(
  'absolute z-50 w-full mt-2 rounded-xl shadow-2xl transition-all duration-300 origin-top',
  {
    variants: {
      variant: {
        default: 'bg-card border border-border shadow-lg',
        clean: 'bg-card border border-border shadow-lg',
        modern: 'bg-card border border-border shadow-lg',
      },
      state: {
        open: 'scale-100 translate-y-0 visible',
        closed: 'scale-95 -translate-y-2 invisible',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'closed',
    },
  }
);

const labelVariants = cva(
  'block font-medium mb-3 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        bold: 'text-foreground font-semibold',
        subtle: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectTriggerVariants> {
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
  labelVariant?: 'default' | 'bold' | 'subtle';
  searchable?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  state,
  labelVariant = 'default',
  className = '',
  name,
  searchable = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentState = error ? 'error' : disabled ? 'disabled' : state || 'default';
  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getSearchInputStyles = () => {
    switch (variant) {
      case 'clean':
        return 'bg-input border-border hover:border-border/80 hover:bg-accent/50 focus:border-ring focus:bg-background';
      case 'modern':
        return 'bg-input border-border hover:bg-accent/50 hover:border-border/80 focus:bg-background focus:border-ring';
      default:
        return 'bg-input border-border hover:border-border/80 hover:bg-accent/50 focus:border-ring focus:bg-background';
    }
  };

  return (
    <div className={`group relative ${className}`} ref={containerRef} {...props}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value || ''} />
      
      {/* Label */}
      {label && (
        <label className={labelVariants({ variant: labelVariant })}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <div
        ref={ref}
        className={selectTriggerVariants({ variant, size, state: currentState })}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ArrowDown2
          size={16}
          className={`text-foreground/70 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </div>

      {/* Dropdown */}
      <div className={dropdownVariants({ 
        variant, 
        state: isOpen ? 'open' : 'closed' 
      })}>
        {/* Search Input */}
        {searchable && (
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <SearchNormal1 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none transition-all duration-300 ${getSearchInputStyles()}`}
              />
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto py-2">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-muted-foreground text-sm text-center">
              {searchable && searchQuery ? 'No options found' : 'No options available'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 ${
                  option.disabled 
                    ? 'text-muted-foreground cursor-not-allowed' 
                    : 'text-foreground hover:bg-accent/50 focus:bg-accent/50 focus:outline-none'
                } ${
                  value === option.value ? 'bg-accent/30' : ''
                }`}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="text-sm">{option.label}</span>
                {value === option.value && (
                  <TickCircle size={16} className="text-foreground" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="mt-2 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select, selectTriggerVariants };
export default Select;