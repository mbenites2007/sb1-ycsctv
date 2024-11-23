import React from 'react';
import { Service, OrderItem } from '../../types';
import OrderFormServiceItem from './OrderFormServiceItem';
import { Package } from 'lucide-react';

interface OrderFormServiceGroupProps {
  service: Service;
  items: OrderItem[];
  onRemoveService: (serviceId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isLoading: boolean;
}

const OrderFormServiceGroup: React.FC<OrderFormServiceGroupProps> = ({
  service,
  items,
  onRemoveService,
  onQuantityChange,
  onRemoveItem,
  isLoading
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <h5 className="text-lg font-medium text-gray-900">
                {service.title}
              </h5>
              <p className="text-sm text-gray-500">
                Código: {service.code}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemoveService(service.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          disabled={isLoading}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <OrderFormServiceItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemoveItem={onRemoveItem}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderFormServiceGroup;