import React from 'react';

interface DecimalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

const DecimalInput: React.FC<DecimalInputProps> = ({ 
  value, 
  onChange, 
  icon, 
  error,
  label,
  className = '',
  ...props 
}) => {
  const [inputValue, setInputValue] = React.useState(formatValue(value));

  function formatValue(num: number): string {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function parseValue(str: string): number {
    const cleanStr = str.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (newValue === '' || newValue === ',') {
      setInputValue(newValue);
      onChange(0);
      return;
    }

    if (/^(\d{1,3}(\.\d{3})*|\d+)(,\d{0,2})?$/.test(newValue)) {
      setInputValue(newValue);
      onChange(parseValue(newValue));
    }
  };

  React.useEffect(() => {
    setInputValue(formatValue(value));
  }, [value]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          type="text"
          value={inputValue}
          onChange={handleChange}
          className={`block w-full ${
            icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right ${className}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DecimalInput;