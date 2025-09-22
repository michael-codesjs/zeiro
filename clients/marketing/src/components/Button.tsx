import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-gray-100 hover:scale-105 focus:ring-white/20",
        secondary: "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-500/20",
        outline: "border border-gray-800 text-white hover:bg-gray-900/50 hover:border-gray-700 focus:ring-gray-500/20",
        ghost: "text-gray-400 hover:text-white hover:bg-gray-900/50 focus:ring-gray-500/20",
        link: "text-gray-400 hover:text-white underline-offset-4 hover:underline focus:ring-gray-500/20",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20",
      },
      size: {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        default: "px-4 py-2 text-sm gap-2",
        lg: "px-8 py-4 text-lg gap-2",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
