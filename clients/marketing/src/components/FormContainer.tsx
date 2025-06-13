import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formContainerVariants = cva(
  // Base styles
  'bg-white/95 backdrop-filter backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden transition-all duration-300',
  {
    variants: {
      showBorder: {
        true: 'border border-gray-200/70',
        false: '',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
      },
    },
    defaultVariants: {
      showBorder: true,
      size: 'md',
    },
  }
);

const formHeaderVariants = cva(
  // Base styles
  'px-8 py-6 border-b border-gray-200/70',
  {
    variants: {
      background: {
        light: 'bg-gradient-to-br from-gray-50 to-gray-100',
        primary: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
        dark: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white',
      },
    },
    defaultVariants: {
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
  showBorder,
  size,
  background,
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={`w-full ${wrapperClassName || ''}`}>
      <div className={formContainerVariants({ showBorder, size, className })}>
        {/* Form header with gradient background */}
        <div className={formHeaderVariants({ background })}>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
          {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
        </div>
        
        {/* Form content with white background and padding */}
        <div className="bg-white/95 px-8 py-6 relative">
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