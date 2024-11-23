import React from 'react';
import { SubService } from '../../types';
import { Package, CircleDollarSign } from 'lucide-react';

interface SubServiceListProps {
  subServices: SubService[];
  serviceId: string;
}

const SubServiceList: React.FC<SubServiceListProps> = ({ subServices, serviceId }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Ordenar subserviços por código
  const sortedSubServices = [...subServices].sort((a, b) => {
    const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidade
              </th>
              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Unitário
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fatores Aplicáveis
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSubServices.map((subService) => (
              <tr key={`${serviceId}-${subService.id}`} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {subService.code}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{subService.unit}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <CircleDollarSign className="h-4 w-4 text-gray-400" />
                    <span>{formatCurrency(subService.unitPrice)}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {subService.allowedFactors?.map(factor => (
                      <span
                        key={`${subService.id}-factor-${factor.id}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {factor.description}
                      </span>
                    )) || (
                      <span className="text-xs text-gray-400 italic">
                        Nenhum fator aplicável
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubServiceList;