import * as React from 'react';
import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles with sophisticated monochrome effects
  'group relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none disabled:cursor-not-allowed overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'bg-white text-black rounded-2xl border-2 border-transparent',
          'hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/20',
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
          'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500',
          'disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none'
        ],
        secondary: [
          'bg-black text-white rounded-2xl border-2 border-gray-700',
          'hover:border-gray-500 hover:bg-gray-950',
          'hover:shadow-xl hover:shadow-black/50 hover:scale-[1.02]',
          'focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-gray-600/20 before:to-transparent',
          'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500'
        ],
        outline: [
          'bg-transparent text-white rounded-2xl border-2 border-gray-600',
          'hover:border-white hover:bg-white/5 hover:shadow-lg hover:shadow-white/10',
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-black',
          'transition-all duration-200'
        ],
        ghost: [
          'bg-transparent text-gray-400 rounded-xl',
          'hover:text-white hover:bg-white/5',
          'focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-black',
          'transition-colors duration-200'
        ],
        minimal: [
          'bg-gray-900 text-white rounded-xl border border-gray-800',
          'hover:bg-gray-800 hover:border-gray-700',
          'hover:shadow-lg hover:shadow-black/30',
          'focus:ring-2 focus:ring-gray-600/50 focus:ring-offset-2 focus:ring-offset-black',
          'transition-all duration-200'
        ],
      },
      size: {
        xs: 'px-3 py-2 text-xs min-h-[32px]',
        sm: 'px-4 py-2.5 text-sm min-h-[36px]',
        md: 'px-6 py-3 text-sm min-h-[40px]',
        lg: 'px-7 py-3.5 text-base min-h-[44px]',
        xl: 'px-8 py-4 text-base min-h-[48px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      fullWidth: false,
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  href?: string; // For link-style buttons
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  disabled = false,
  className,
  href,
  ...props
}) => {
  const getLoadingSpinner = () => {
    const spinnerClass = variant === 'primary' 
      ? 'border-black/30 border-t-black' 
      : 'border-white/30 border-t-white';
    
    const pingClass = variant === 'primary'
      ? 'border-t-black/20'
      : 'border-t-white/20';
    
    return (
      <div className="relative">
        <div className={`w-4 h-4 border-2 rounded-full animate-spin ${spinnerClass}`}></div>
        <div className={`absolute inset-0 w-4 h-4 border-2 border-transparent rounded-full animate-ping ${pingClass}`}></div>
      </div>
    );
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          {getLoadingSpinner()}
          <span className="relative">
            {loadingText || 'Loading...'}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 animate-pulse"></span>
          </span>
        </div>
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2 transition-transform duration-200 group-hover:scale-110">
              {leftIcon}
            </span>
          )}
          <span className="relative z-10">{children}</span>
          {rightIcon && (
            <span className="ml-2 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </>
  );

  const buttonClasses = buttonVariants({
    variant,
    size,
    fullWidth,
    className,
  });

  // If href is provided, render as a link styled as a button
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {buttonContent}
      </a>
    );
  }

  // Otherwise render as a button
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export { Button, buttonVariants };
export default Button;