import React from 'react';
import { Service } from '../../types';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import SubServiceList from './SubServiceList';

interface ServiceListItemProps {
  service: Service;
  isExpanded: boolean;
  onToggleExpand: (serviceId: string) => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onToggleExpand(service.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                  {service.code}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.title}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(service)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Editar"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(service.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && service.subServices.length > 0 && (
        <SubServiceList subServices={service.subServices} serviceId={service.id} />
      )}
    </div>
  );
};

export default ServiceListItem;