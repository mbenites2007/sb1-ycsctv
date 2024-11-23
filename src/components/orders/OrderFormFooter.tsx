import React from 'react';
import { MapPin } from 'lucide-react';
import CurrencyInput from '../common/CurrencyInput';
import { Order } from '../../types';

interface OrderFormFooterProps {
  status: Order['status'];
  discount: number;
  subtotal: number;
  total: number;
  observations: string;
  isLoading: boolean;
  onStatusChange: (status: Order['status']) => void;
  onDiscountChange: (discount: number) => void;
  onObservationsChange: (observations: string) => void;
}

const OrderFormFooter: React.FC<OrderFormFooterProps> = ({
  status,
  discount,
  subtotal,
  total,
  observations,
  isLoading,
  onStatusChange,
  onDiscountChange,
  onObservationsChange
}) => {
  return (
    <div className="border-t pt-6">
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as Order['status'])}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="draft">Rascunho</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>

        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desconto
          </label>
          <CurrencyInput
            value={discount}
            onChange={onDiscountChange}
            placeholder="Valor do desconto"
            icon={<MapPin className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
        </div>

        <div className="col-span-4 flex flex-col justify-end">
          <div className="text-sm text-gray-600">
            Subtotal: {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(subtotal)}
          </div>
          <div className="text-xl font-semibold text-gray-900">
            Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(total)}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Observações adicionais..."
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default OrderFormFooter;