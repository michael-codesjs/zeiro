import React, { ReactNode } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

const backgroundVariants = cva(
  // Base styles
  'absolute inset-0 -z-10 overflow-hidden',
  {
    variants: {
      gradient: {
        default: 'bg-gradient-to-br from-indigo-500 to-purple-600',
        blue: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
        cyan: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      },
    },
    defaultVariants: {
      gradient: 'default',
    },
  }
);

interface ZeroBackgroundProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof backgroundVariants> {
  children: ReactNode;
  showHeader?: boolean;
}

const ZeroBackground: React.FC<ZeroBackgroundProps> = ({ 
  children, 
  gradient,
  showHeader = true,
  className,
  ...props 
}) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" {...props}>
      {/* Animated Grid Background */}
      <div className={backgroundVariants({ gradient, className })}>
        {/* Primary grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid-pattern-primary"></div>
        </div>
        
        {/* Secondary grid overlay - offset and rotated slightly for more depth */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern-secondary"></div>
        </div>
        
        {/* Animated floating dots - now positioned within the parent for better visibility */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
          <div className="dot dot-4"></div>
          <div className="dot dot-5"></div>
          <div className="dot dot-6"></div>
          <div className="dot dot-7"></div>
          <div className="dot dot-8"></div>
          <div className="dot dot-9"></div>
          <div className="dot dot-10"></div>
          <div className="dot dot-11"></div>
          <div className="dot dot-12"></div>
        </div>
        
        {/* Moving light effect */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white filter blur-[120px] opacity-10 animate-drift-slow"></div>
        <div className="absolute top-[60%] right-[5%] w-[50%] h-[50%] rounded-full bg-purple-300 filter blur-[100px] opacity-15 animate-drift-medium"></div>
        
        {/* Glow effects */}
        <div className="absolute top-[-10%] left-[5%] w-[40%] h-[40%] rounded-full bg-purple-400 filter blur-[80px] opacity-20 animate-blob"></div>
        <div className="absolute top-[60%] left-[50%] w-[30%] h-[30%] rounded-full bg-indigo-400 filter blur-[80px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-purple-500 filter blur-[80px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      {showHeader && (
        <header className="absolute top-0 left-0 w-full px-6 py-4 z-20">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="font-bold text-white text-2xl">
              zeiro
            </Link>
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        {children}
      </div>
    </div>
  );
};

export { ZeroBackground, backgroundVariants };
export default ZeroBackground; 