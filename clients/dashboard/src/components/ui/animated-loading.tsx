"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AnimatedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dots' | 'spinner' | 'pulse' | 'bars' | 'wave';
  color?: string;
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const DotsLoader = ({ size = 'md', color = 'bg-gray-600' }: { size: string, color: string }) => {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }[size];

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-full", color, dotSize)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const SpinnerLoader = ({ size = 'md', color = 'border-gray-600' }: { size: string, color: string }) => {
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses];
  
  return (
    <motion.div
      className={cn(
        "rounded-full border-2 border-transparent border-t-current",
        sizeClass,
        color
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

const PulseLoader = ({ size = 'md', color = 'bg-gray-600' }: { size: string, color: string }) => {
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses];
  
  return (
    <motion.div
      className={cn("rounded-full", color, sizeClass)}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

const BarsLoader = ({ size = 'md', color = 'bg-gray-600' }: { size: string, color: string }) => {
  const barHeight = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  }[size];

  const barWidth = {
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1.5',
    xl: 'w-2'
  }[size];

  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-sm", color, barWidth)}
          animate={{
            height: ["20%", "100%", "20%"]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
          style={{ height: barHeight }}
        />
      ))}
    </div>
  );
};

const WaveLoader = ({ size = 'md', color = 'bg-gray-600' }: { size: string, color: string }) => {
  const waveSize = {
    sm: 'w-6 h-1',
    md: 'w-12 h-2',
    lg: 'w-18 h-3',
    xl: 'w-24 h-4'
  }[size];

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-full", color)}
          style={{
            width: size === 'sm' ? '2px' : size === 'md' ? '4px' : size === 'lg' ? '6px' : '8px',
            height: size === 'sm' ? '2px' : size === 'md' ? '4px' : size === 'lg' ? '6px' : '8px'
          }}
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default function AnimatedLoading({
  size = 'md',
  variant = 'spinner',
  color,
  className,
  text
}: AnimatedLoadingProps) {
  const defaultColors = {
    dots: 'bg-gray-600',
    spinner: 'text-gray-600',
    pulse: 'bg-gray-600',
    bars: 'bg-gray-600',
    wave: 'bg-gray-600'
  };

  const loaderColor = color || defaultColors[variant];

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} color={loaderColor} />;
      case 'pulse':
        return <PulseLoader size={size} color={loaderColor} />;
      case 'bars':
        return <BarsLoader size={size} color={loaderColor} />;
      case 'wave':
        return <WaveLoader size={size} color={loaderColor} />;
      case 'spinner':
      default:
        return <SpinnerLoader size={size} color={loaderColor} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderLoader()}
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm text-gray-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ 
  isVisible, 
  text = "Loading...",
  variant = 'spinner' 
}: { 
  isVisible: boolean; 
  text?: string;
  variant?: AnimatedLoadingProps['variant'];
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        <AnimatedLoading 
          size="lg" 
          variant={variant}
          text={text}
          color="text-gray-800"
        />
      </motion.div>
    </motion.div>
  );
}
