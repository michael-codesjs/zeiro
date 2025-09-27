import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  // Base styles for all cards
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card border border-border shadow-sm',
        primary: 'bg-card border border-primary/20 shadow-lg shadow-primary/10',
        secondary: 'bg-secondary/50 border border-border',
        gradient: 'bg-gradient-to-br from-secondary/30 to-accent/30 border border-border',
        outline: 'bg-transparent border border-border',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-lg',
        grow: 'hover:scale-[1.02]',
        glow: 'hover:shadow-xl hover:shadow-primary/10',
      },
      rounded: {
        default: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'none',
      rounded: 'default',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  variant,
  size,
  hover,
  rounded,
  className,
  ...props
}) => {
  return (
    <div 
      className={cardVariants({ variant, size, hover, rounded, className })}
      {...props}
    >
      {children}
    </div>
  );
};

// Header, Body, and Footer components for structured cards
const CardHeader = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`mb-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`mt-4 pt-4 border-t border-border ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter, cardVariants };
export default Card; 