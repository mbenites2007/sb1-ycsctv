import React, { useState, useEffect } from 'react';
import { Order, OrderItem, Service, Client, ServiceGroup } from '../../types';
import OrderFormHeader from './OrderFormHeader';
import OrderFormServiceGroup from './OrderFormServiceGroup';
import OrderFormServiceSelect from './OrderFormServiceSelect';
import OrderFormFooter from './OrderFormFooter';
import { ServiceService } from '../../services/firebase/service.service';
import { ClientService } from '../../services/firebase/client.service';

interface OrderFormProps {
  onSubmit: (data: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Order;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>>({
    clientId: initialData?.clientId || '',
    clientName: initialData?.clientName || '',
    clientDocument: initialData?.clientDocument || '',
    clientCity: initialData?.clientCity || '',
    clientState: initialData?.clientState || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    items: initialData?.items || [],
    subtotal: initialData?.subtotal || 0,
    discount: initialData?.discount || 0,
    total: initialData?.total || 0,
    status: initialData?.status || 'draft',
    observations: initialData?.observations || ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [fetchedClients, fetchedGroups] = await Promise.all([
          ClientService.getAllClients(),
          ServiceService.getAllServiceGroups()
        ]);
        
        setClients(fetchedClients);
        setServiceGroups(fetchedGroups);

        if (initialData?.clientId) {
          const client = fetchedClients.find(c => c.id === initialData.clientId);
          if (client) {
            setSelectedClient(client);
          }
        }
      } catch (error) {
        setErrors({ load: 'Erro ao carregar dados. Por favor, recarregue a página.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialData?.clientId]);

  const addServiceWithoutFactor = (serviceId: string) => {
    const service = serviceGroups
      .flatMap(group => group.services)
      .find(s => s.id === serviceId);
    
    if (!service) return;

    const newItems = service.subServices.map(subService => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId: service.id,
      subServiceId: subService.id,
      code: subService.code,
      description: subService.description,
      unit: subService.unit,
      quantity: 0,
      unitPrice: subService.unitPrice,
      total: 0,
      observations: ''
    }));

    setFormData(prev => {
      const updatedItems = [...prev.items, ...newItems];
      const subtotal = calculateSubtotal(updatedItems);
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total: calculateTotal(subtotal, prev.discount || 0)
      };
    });
  };

  const calculateSubtotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = (subtotal: number, discount: number) => {
    return subtotal - (discount || 0);
  };

  const handleRemoveServiceItems = (serviceId: string) => {
    setFormData(prev => {
      const newItems = prev.items.filter(item => item.serviceId !== serviceId);
      const subtotal = calculateSubtotal(newItems);
      return {
        ...prev,
        items: newItems,
        subtotal,
        total: calculateTotal(subtotal, prev.discount || 0)
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const subtotal = calculateSubtotal(newItems);
      return {
        ...prev,
        items: newItems,
        subtotal,
        total: calculateTotal(subtotal, prev.discount || 0)
      };
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            total: quantity * item.unitPrice
          };
        }
        return item;
      });

      const subtotal = calculateSubtotal(newItems);
      return {
        ...prev,
        items: newItems,
        subtotal,
        total: calculateTotal(subtotal, prev.discount || 0)
      };
    });
  };

  const handleDiscountChange = (discount: number) => {
    setFormData(prev => ({
      ...prev,
      discount,
      total: calculateTotal(prev.subtotal, discount)
    }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);

    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name,
        clientDocument: client.document,
        clientCity: client.city,
        clientState: client.state
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientDocument: '',
        clientCity: '',
        clientState: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um serviço';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        await onSubmit(formData);
      } catch (error: any) {
        setErrors({
          submit: error.message || 'Erro ao salvar orçamento'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Group items by service
  const itemsByService = formData.items.reduce((acc, item) => {
    if (!acc[item.serviceId]) {
      acc[item.serviceId] = [];
    }
    acc[item.serviceId].push(item);
    return acc;
  }, {} as Record<string, OrderItem[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      {errors.load && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errors.load}
        </div>
      )}

      <OrderFormHeader
        clientId={formData.clientId}
        date={formData.date}
        clients={clients}
        errors={errors}
        isLoading={isLoading}
        onClientChange={handleClientChange}
        onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
      />

      <div className="border-t pt-6">
        <div className="mb-6">
          <OrderFormServiceSelect
            serviceGroups={serviceGroups}
            onServiceSelect={addServiceWithoutFactor}
            disabled={isLoading || !selectedClient}
          />
          {!selectedClient && (
            <p className="mt-2 text-sm text-yellow-600">
              Selecione um cliente para adicionar serviços
            </p>
          )}
          {errors.items && (
            <p className="mt-2 text-sm text-red-600">{errors.items}</p>
          )}
        </div>

        <div className="space-y-6">
          {Object.entries(itemsByService).map(([serviceId, items]) => {
            const service = serviceGroups
              .flatMap(g => g.services)
              .find(s => s.id === serviceId);
            
            if (!service) return null;

            return (
              <OrderFormServiceGroup
                key={serviceId}
                service={service}
                items={items}
                onRemoveService={handleRemoveServiceItems}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </div>

      <OrderFormFooter
        status={formData.status}
        discount={formData.discount}
        subtotal={formData.subtotal}
        total={formData.total}
        observations={formData.observations}
        isLoading={isLoading}
        onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
        onDiscountChange={handleDiscountChange}
        onObservationsChange={(observations) => setFormData(prev => ({ ...prev, observations }))}
      />

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;