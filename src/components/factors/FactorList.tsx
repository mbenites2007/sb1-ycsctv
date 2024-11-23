import React from 'react';
import { Factor } from '../../types';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface FactorListProps {
  factors: Factor[];
  onEdit: (factor: Factor) => void;
  onDelete: (factor: Factor) => void;
}

const FactorList: React.FC<FactorListProps> = ({ factors, onEdit, onDelete }) => {
  const [expandedFactors, setExpandedFactors] = React.useState<Set<string>>(new Set());

  const toggleExpand = (factorId: string) => {
    const newExpanded = new Set(expandedFactors);
    if (newExpanded.has(factorId)) {
      newExpanded.delete(factorId);
    } else {
      newExpanded.add(factorId);
    }
    setExpandedFactors(newExpanded);
  };

  if (factors.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Nenhum fator cadastrado</p>
      </div>
    );
  }

  // Ordenar fatores numericamente pelo código
  const sortedFactors = [...factors].sort((a, b) => a.cod_fator - b.cod_fator);

  return (
    <div className="space-y-4">
      {sortedFactors.map((factor) => (
        <div
          key={`factor-${factor.cod_fator}-${factor.id}`}
          className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleExpand(factor.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedFactors.has(factor.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                      {factor.cod_fator}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {factor.descricao_fator}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(factor)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(factor)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {expandedFactors.has(factor.id) && factor.subitems.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-2">
                {factor.subitems.map((subitem) => (
                  <div
                    key={`subitem-${factor.cod_fator}-${subitem.cod_subitem}-${subitem.id}`}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                        {subitem.cod_subitem}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {subitem.descricao_subitem}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {subitem.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FactorList;