import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formCardVariants = cva(
  // Base styles for sophisticated card
  'relative backdrop-blur-xl border rounded-3xl shadow-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-gray-900/40 border-gray-700/50',
          'shadow-black/20 hover:shadow-black/30',
        ],
        elevated: [
          'bg-gray-800/60 border-gray-600/40',
          'shadow-black/30 hover:shadow-black/40',
          'hover:-translate-y-1',
        ],
        glass: [
          'bg-white/5 border-white/10',
          'shadow-white/5 hover:shadow-white/10',
          'backdrop-blur-2xl',
        ],
        subtle: [
          'bg-gray-900/20 border-gray-800/30',
          'shadow-black/10',
        ],
      },
      size: {
        sm: 'p-6',
        md: 'p-8',
        lg: 'p-10',
        xl: 'p-12',
      },
      spacing: {
        compact: 'space-y-4',
        normal: 'space-y-6',
        relaxed: 'space-y-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
      spacing: 'normal',
    },
  }
);

interface FormCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof formCardVariants> {
  children: ReactNode;
}

const FormCard: React.FC<FormCardProps> = ({
  children,
  variant,
  size,
  spacing,
  className,
  ...props
}) => {
  return (
    <div 
      className={formCardVariants({ variant, size, spacing, className })}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-3xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { FormCard, formCardVariants };
export default FormCard;
