import React from 'react';
import { Factor, ClientFactor } from '../../types';
import { Percent } from 'lucide-react';
import FactorSelect from './FactorSelect';

interface FactorSectionProps {
  factors: Factor[];
  clientFactors: ClientFactor[];
  onFactorChange: (factorId: string, subItemId: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const FactorSection: React.FC<FactorSectionProps> = ({
  factors,
  clientFactors,
  onFactorChange,
  isLoading,
  disabled
}) => {
  if (isLoading) {
    return (
      <div className="border-t pt-4">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando fatores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <div className="flex items-center space-x-2 mb-3">
        <Percent className="h-4 w-4 text-gray-400" />
        <h4 className="text-sm font-medium text-gray-700">Fatores de Correção</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {factors.map(factor => {
          const selectedFactor = clientFactors.find(f => f.factorId === factor.id);
          
          return (
            <FactorSelect
              key={`factor-${factor.id}`}
              factor={factor}
              selectedSubItemId={selectedFactor?.subItemId}
              onChange={onFactorChange}
              disabled={disabled || isLoading}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FactorSection;