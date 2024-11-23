import React from 'react';
import { Calendar } from 'lucide-react';
import InputField from '../common/InputField';
import { Client } from '../../types';

interface OrderFormHeaderProps {
  clientId: string;
  date: string;
  clients: Client[];
  errors: Record<string, string>;
  isLoading: boolean;
  onClientChange: (clientId: string) => void;
  onDateChange: (date: string) => void;
}

const OrderFormHeader: React.FC<OrderFormHeaderProps> = ({
  clientId,
  date,
  clients,
  errors,
  isLoading,
  onClientChange,
  onDateChange
}) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente
        </label>
        <select
          value={clientId}
          onChange={(e) => onClientChange(e.target.value)}
          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        >
          <option value="">Selecione um cliente</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} - {client.document}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="text-sm text-red-600 mt-1">{errors.clientId}</p>
        )}
      </div>

      <div className="col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <InputField
          type="date"
          name="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          icon={<Calendar className="h-5 w-5 text-gray-400" />}
          error={errors.date}
          className="h-10"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default OrderFormHeader;