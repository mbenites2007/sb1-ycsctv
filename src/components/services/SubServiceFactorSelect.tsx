import React from 'react';
import { Factor } from '../../types';
import { Percent } from 'lucide-react';

interface SubServiceFactorSelectProps {
  factors: Factor[];
  selectedFactorIds: string[];
  onChange: (factorIds: string[]) => void;
  disabled?: boolean;
}

const SubServiceFactorSelect: React.FC<SubServiceFactorSelectProps> = ({
  factors,
  selectedFactorIds,
  onChange,
  disabled
}) => {
  const handleFactorToggle = (factorId: string) => {
    const newSelection = selectedFactorIds.includes(factorId)
      ? selectedFactorIds.filter(id => id !== factorId)
      : [...selectedFactorIds, factorId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <Percent className="h-4 w-4" />
        <span>Fatores Aplicáveis</span>
      </label>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
        {factors.map(factor => (
          <button
            key={factor.id}
            type="button"
            onClick={() => handleFactorToggle(factor.id)}
            disabled={disabled}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors
              ${selectedFactorIds.includes(factor.id)
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Percent className="h-4 w-4 mr-1.5" />
            {factor.descricao_fator}
          </button>
        ))}
        {factors.length === 0 && (
          <span className="text-sm text-gray-500 italic p-2">
            Nenhum fator disponível
          </span>
        )}
      </div>
      {selectedFactorIds.length > 0 && (
        <p className="text-xs text-gray-500">
          {selectedFactorIds.length} fator{selectedFactorIds.length !== 1 ? 'es' : ''} selecionado{selectedFactorIds.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default SubServiceFactorSelect;