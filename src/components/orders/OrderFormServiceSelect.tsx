import React from 'react';
import { ServiceGroup } from '../../types';
import { Package } from 'lucide-react';

interface OrderFormServiceSelectProps {
  serviceGroups: ServiceGroup[];
  onServiceSelect: (serviceId: string) => void;
  disabled?: boolean;
}

const OrderFormServiceSelect: React.FC<OrderFormServiceSelectProps> = ({
  serviceGroups,
  onServiceSelect,
  disabled
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <select
          onChange={(e) => {
            if (e.target.value) {
              onServiceSelect(e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          disabled={disabled}
        >
          <option value="">Selecione um serviço...</option>
          {serviceGroups.map(group => (
            <optgroup key={group.id} label={group.name}>
              {group.services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.code} - {service.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="flex items-center text-gray-400">
        <Package className="h-5 w-5 mr-2" />
        <span className="text-sm">Adicionar Serviço</span>
      </div>
    </div>
  );
};

export default OrderFormServiceSelect;