import React from 'react';
import { OrderItem } from '../../types';

interface OrderFormServiceItemProps {
  item: OrderItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isLoading: boolean;
}

const OrderFormServiceItem: React.FC<OrderFormServiceItemProps> = ({
  item,
  onQuantityChange,
  onRemoveItem,
  isLoading
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseFloat(e.target.value) || 0;
    if (newQuantity >= 0) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-2">
      <div className="col-span-2">
        <span className="text-sm font-medium text-gray-900">
          {item.code}
        </span>
      </div>

      <div className="col-span-4">
        <span className="text-sm font-medium text-gray-900">
          {item.description}
        </span>
      </div>

      <div className="col-span-2">
        <span className="text-sm text-gray-600">
          {item.unit}
        </span>
      </div>

      <div className="col-span-2">
        <input
          type="number"
          value={item.quantity || ''}
          onChange={handleQuantityChange}
          placeholder="Qtd"
          min="0"
          step="0.01"
          className="block w-full px-3 py-2 text-right border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          disabled={isLoading}
        />
      </div>

      <div className="col-span-1 text-right">
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(item.total)}
        </span>
      </div>

      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OrderFormServiceItem;