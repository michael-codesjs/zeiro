import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover hover:scale-105 focus:ring-ring/20",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary-hover hover:border-border focus:ring-ring/20",
        outline: "border border-border text-foreground hover:bg-accent hover:border-border focus:ring-ring/20",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-accent focus:ring-ring/20",
        link: "text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus:ring-ring/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20",
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
