import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formContainerVariants = cva(
  // Base styles
  'backdrop-filter backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden transition-all duration-300',
  {
    variants: {
      theme: {
        light: 'bg-white/95',
        dark: 'bg-gray-900/90 border-gray-800',
      },
      showBorder: {
        true: 'border',
        false: '',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
      },
    },
    compoundVariants: [
      {
        theme: 'light',
        showBorder: true,
        class: 'border-gray-200/70',
      },
      {
        theme: 'dark',
        showBorder: true,
        class: 'border-gray-800',
      },
    ],
    defaultVariants: {
      theme: 'light',
      showBorder: true,
      size: 'md',
    },
  }
);

const formHeaderVariants = cva(
  // Base styles
  'px-8 py-6 border-b',
  {
    variants: {
      theme: {
        light: 'border-gray-200/70',
        dark: 'border-gray-800',
      },
      background: {
        light: 'bg-gradient-to-br from-gray-50 to-gray-100',
        primary: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
        dark: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white',
        darkPrimary: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-white',
      },
    },
    defaultVariants: {
      theme: 'light',
      background: 'light',
    },
  }
);

interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement>, 
  VariantProps<typeof formContainerVariants>,
  VariantProps<typeof formHeaderVariants> {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBorder?: boolean;
  wrapperClassName?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  title, 
  subtitle, 
  onSubmit, 
  theme = 'light',
  showBorder,
  size,
  background,
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={`w-full ${wrapperClassName || ''}`}>
      <div className={formContainerVariants({ theme, showBorder, size, className })}>
        {/* Form header with gradient background */}
        <div className={formHeaderVariants({ theme, background })}>
          <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
          {subtitle && <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
        </div>
        
        {/* Form content with background and padding */}
        <div className={`px-8 py-6 relative ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/95'}`}>
          <form onSubmit={onSubmit} className="relative" {...props}>
            {/* Form children */}
            {children}
          </form>
        </div>
      </div>
    </div>
  );
};

export { FormContainer, formContainerVariants, formHeaderVariants };
export default FormContainer; 