import React from 'react';
import { ServiceGroup, Service } from '../../types';
import { Pencil, Trash2, ChevronDown, ChevronUp, Package, CircleDollarSign, Plus, Percent } from 'lucide-react';

interface ServiceListProps {
  serviceGroups: ServiceGroup[];
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onEditGroup: (group: ServiceGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddService: (groupId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  serviceGroups,
  onEditService,
  onDeleteService,
  onEditGroup,
  onDeleteGroup,
  onAddService
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para extrair número do código
  const getNumericCode = (code: string): number => {
    return parseInt(code.replace(/\D/g, '')) || 0;
  };

  // Ordenar grupos por código numérico
  const sortedGroups = [...serviceGroups].sort((a, b) => getNumericCode(a.code) - getNumericCode(b.code));

  if (serviceGroups.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum grupo de serviços</h3>
        <p className="mt-1 text-sm text-gray-500">Comece criando um novo grupo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedGroups.map((group) => {
        // Ordenar serviços por código numérico
        const sortedServices = [...group.services].sort((a, b) => getNumericCode(a.code) - getNumericCode(b.code));

        return (
          <div key={`group-${group.id}`} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                        {group.code}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAddService(group.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Adicionar serviço"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEditGroup(group)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Editar grupo"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDeleteGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Excluir grupo"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {expandedGroups.has(group.id) && (
              <div className="border-t border-gray-200">
                {sortedServices.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {sortedServices.map((service) => {
                      // Ordenar subserviços por código numérico
                      const sortedSubServices = [...service.subServices].sort(
                        (a, b) => getNumericCode(a.code) - getNumericCode(b.code)
                      );

                      // Verificar se algum subserviço tem fatores aplicáveis
                      const hasFactors = sortedSubServices.some(sub => 
                        sub.allowedFactors && sub.allowedFactors.length > 0
                      );

                      return (
                        <div key={`service-${service.id}`} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3">
                                <span className="px-2.5 py-0.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                  {service.code}
                                </span>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {service.title}
                                </h4>
                                {hasFactors && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    <Percent className="h-3 w-3 mr-1" />
                                    Fatores Aplicáveis
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onEditService(service)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                title="Editar"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => onDeleteService(service.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descrição
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unidade
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor Unitário
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fatores
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {sortedSubServices.map((subService) => (
                                  <tr key={`subservice-${service.id}-${subService.id}`}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {subService.code}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {subService.description}
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
                                      {subService.allowedFactors && subService.allowedFactors.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {subService.allowedFactors.map(factor => (
                                            <span
                                              key={`factor-${subService.id}-${factor.id}`}
                                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                            >
                                              <Percent className="h-3 w-3 mr-1" />
                                              {factor.description}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">Nenhum fator</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Nenhum serviço neste grupo</p>
                    <button
                      onClick={() => onAddService(group.id)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Serviço
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceList;