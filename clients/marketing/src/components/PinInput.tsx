import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

export interface PinInputProps {
  length?: number;
  onComplete?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  value?: string;
  disabled?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  placeholder = "•",
  autoFocus = false,
  value = "",
  disabled = false
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update values when external value changes
  useEffect(() => {
    if (value) {
      const valueArray = value.split('').slice(0, length);
      const newValues = [...Array(length).fill('')];
      valueArray.forEach((char, index) => {
        newValues[index] = char;
      });
      setValues(newValues);
    }
  }, [value, length]);

  // Focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    if (newValue.length > 1) {
      // Handle paste
      const pastedValue = newValue.slice(0, length);
      const newValues = [...Array(length).fill('')];
      pastedValue.split('').forEach((char, i) => {
        if (i < length) {
          newValues[i] = char;
        }
      });
      setValues(newValues);
      
      // Call onChange with the complete value
      const combinedValue = newValues.join('');
      if (onChange) onChange(combinedValue);
      if (onComplete && combinedValue.length === length) onComplete(combinedValue);
      
      // Focus the last input
      if (inputRefs.current[Math.min(pastedValue.length, length) - 1]) {
        inputRefs.current[Math.min(pastedValue.length, length) - 1].focus();
      }
    } else {
      // Handle single character input
      const newValues = [...values];
      newValues[index] = newValue;
      setValues(newValues);
      
      // Call onChange with the complete value
      if (onChange) onChange(newValues.join(''));
      
      // Check if the input is complete
      if (onComplete && newValues.join('').length === length) {
        onComplete(newValues.join(''));
      }
      
      // Focus next input if available
      if (newValue && index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Focus previous input on left arrow
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Focus next input on right arrow
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!pastedData) return;
    
    const newValues = [...values];
    const pastedChars = pastedData.split('');
    
    for (let i = 0; i < length - index; i++) {
      if (i < pastedChars.length) {
        newValues[index + i] = pastedChars[i];
      }
    }
    
    setValues(newValues);
    
    const combinedValue = newValues.join('');
    if (onChange) onChange(combinedValue);
    if (onComplete && combinedValue.length === length) onComplete(combinedValue);
    
    // Focus the correct input after paste
    const focusIndex = Math.min(index + pastedChars.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {[...Array(length)].map((_, index) => (
        <div key={index} className="relative">
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={values[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            maxLength={1}
            className={`w-12 h-14 text-center text-lg md:text-xl font-bold rounded-lg border-2 focus:ring-2 outline-none transition-all duration-200 ${
              disabled
                ? 'bg-gray-100 border-gray-200 text-gray-400'
                : 'bg-white/90 border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-gray-800'
            }`}
            autoComplete="one-time-code"
            inputMode="numeric"
            disabled={disabled}
            placeholder={values[index] ? '' : placeholder}
            aria-label={`Pin code digit ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
};

export default PinInput; 