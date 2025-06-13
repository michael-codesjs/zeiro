import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  // Base styles for all cards
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 shadow-sm',
        primary: 'bg-white border border-indigo-100 shadow-lg shadow-indigo-100/20',
        secondary: 'bg-indigo-50/50 border border-indigo-100',
        gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100',
        outline: 'bg-transparent border border-gray-200',
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
        glow: 'hover:shadow-xl hover:shadow-indigo-200/20',
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
      className={`mt-4 pt-4 border-t border-gray-100 ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter, cardVariants };
export default Card; 