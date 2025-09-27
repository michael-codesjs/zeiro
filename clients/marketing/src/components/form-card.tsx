import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formCardVariants = cva(
  // Base styles for sophisticated card
  'relative backdrop-blur-xl border rounded-3xl shadow-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-card/95 border-border',
          'shadow-lg hover:shadow-xl',
        ],
        elevated: [
          'bg-card border-border',
          'shadow-xl hover:shadow-2xl',
          'hover:-translate-y-1',
        ],
        glass: [
          'bg-card/80 border-border/50',
          'shadow-lg hover:shadow-xl',
          'backdrop-blur-2xl',
        ],
        subtle: [
          'bg-card/60 border-border/30',
          'shadow-sm',
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
      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent rounded-3xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { FormCard, formCardVariants };
export default FormCard;
