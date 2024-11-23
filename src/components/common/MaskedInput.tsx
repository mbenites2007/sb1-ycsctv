import React, { useEffect, useRef } from 'react';
import VMasker from 'vanilla-masker';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'cnpj' | 'phone';
  icon?: React.ReactNode;
  error?: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({ mask, icon, error, onChange, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const maskPattern = mask === 'cnpj' 
        ? '99.999.999/9999-99'
        : '(99)9999-9999';

      VMasker(inputRef.current).maskPattern(maskPattern);
    }
  }, [mask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          {...props}
          onChange={handleChange}
          className={`block w-full ${
            icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MaskedInput;