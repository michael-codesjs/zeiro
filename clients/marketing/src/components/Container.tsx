import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const containerVariants = cva(
  // Base styles for all containers
  'px-4 sm:px-6 mx-auto',
  {
    variants: {
      size: {
        sm: 'max-w-3xl',
        md: 'max-w-5xl',
        lg: 'max-w-7xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'py-0',
        sm: 'py-4',
        md: 'py-8',
        lg: 'py-16',
        xl: 'py-24',
        '2xl': 'py-32',
      },
      centered: {
        true: 'flex flex-col items-center justify-center',
        false: '',
      },
    },
    defaultVariants: {
      size: 'lg',
      padding: 'md',
      centered: false,
    },
  }
);

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const Container: React.FC<ContainerProps> = ({
  children,
  size,
  padding,
  centered,
  className,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component 
      className={containerVariants({ size, padding, centered, className })}
      {...props}
    >
      {children}
    </Component>
  );
};

export { Container, containerVariants };
export default Container; 