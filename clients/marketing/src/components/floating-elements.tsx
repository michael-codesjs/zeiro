'use client';

import { motion } from 'framer-motion';

interface FloatingElementsProps {
  variant?: 'default' | 'dense' | 'sparse' | 'minimal';
  colors?: string[];
  className?: string;
}

const FloatingElements = ({ 
  variant = 'default', 
  colors = ['blue', 'purple', 'green', 'yellow', 'indigo', 'pink', 'teal', 'cyan', 'orange', 'violet', 'emerald', 'rose'],
  className = ''
}: FloatingElementsProps) => {
  const getElementCount = () => {
    switch (variant) {
      case 'minimal': return 2;
      case 'sparse': return 3;
      case 'default': return 4;
      case 'dense': return 6;
      default: return 4;
    }
  };

  const getElementConfig = (index: number) => {
    const positions = [
      { top: '10%', left: '8%' },
      { top: '15%', right: '12%' },
      { bottom: '20%', left: '15%' },
      { bottom: '25%', right: '10%' },
      { top: '40%', left: '5%' },
      { top: '60%', right: '8%' }
    ];

    const sizes = ['w-16 h-16', 'w-20 h-20', 'w-24 h-24', 'w-28 h-28', 'w-32 h-32', 'w-18 h-18'];
    const blurs = ['blur-xl', 'blur-2xl', 'blur-3xl'];
    const opacities = ['/6', '/7', '/8', '/10'];

    const color = colors[index % colors.length];
    const position = positions[index % positions.length];
    const size = sizes[index % sizes.length];
    const blur = blurs[index % blurs.length];
    const opacity = opacities[index % opacities.length];

    return {
      position,
      className: `absolute ${size} bg-${color}-500${opacity} rounded-full ${blur}`,
      animation: {
        y: [0, -20 - (index * 5), 0],
        x: index % 2 === 0 ? [0, 15 + (index * 3), 0] : [0, -(10 + index * 2), 0],
        rotate: [0, index % 2 === 0 ? 8 + index : -(6 + index), 0],
        scale: index % 3 === 0 ? [1, 1.1 + (index * 0.05), 1] : [1, 1, 1]
      },
      transition: {
        duration: 12 + (index * 2),
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 1.5
      }
    };
  };

  const elements = Array.from({ length: getElementCount() }, (_, index) => {
    const config = getElementConfig(index);
    const positionStyle = Object.entries(config.position).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    return (
      <motion.div
        key={index}
        animate={config.animation}
        transition={config.transition}
        className={config.className}
        style={positionStyle}
      />
    );
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements}
      
      {/* Subtle glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 pointer-events-none" />
    </div>
  );
};

export default FloatingElements;
