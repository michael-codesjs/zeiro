import React, { useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';

interface TypingAnimationProps {
  text: string;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ text, onComplete }) => {
  // Calculate typing duration based on text length (roughly 50ms per character)
  const typingDuration = text.length * 50;

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, typingDuration + 500); // Add small buffer after typing completes

      return () => clearTimeout(timer);
    }
  }, [onComplete, typingDuration]);

  return (
    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
      <TypeAnimation
        sequence={[text]}
        wrapper="span"
        speed={50}
        style={{ display: 'inline-block' }}
        cursor={true}
        repeat={0}
      />
    </div>
  );
}; 