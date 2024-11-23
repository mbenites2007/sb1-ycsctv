import React from 'react';
import { Factor } from '../../types';

interface FactorSelectProps {
  factor: Factor;
  selectedSubItemId?: string;
  onChange: (factorId: string, subItemId: string) => void;
  disabled?: boolean;
}

const FactorSelect: React.FC<FactorSelectProps> = ({
  factor,
  selectedSubItemId,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {factor.descricao_fator}
      </label>
      <select
        value={selectedSubItemId || ''}
        onChange={(e) => onChange(factor.id, e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        disabled={disabled}
      >
        <option value="">Selecione um valor</option>
        {factor.subitems.map(subItem => (
          <option 
            key={`${factor.id}-${subItem.id}`}
            value={subItem.id}
            className="py-1"
          >
            {subItem.descricao_subitem} ({subItem.valor})
          </option>
        ))}
      </select>
    </div>
  );
};

export default FactorSelect;