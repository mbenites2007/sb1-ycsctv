import React, { useState } from 'react';
import { Order } from '../types';
import OrderList from '../components/orders/OrderList';
import OrderForm from '../components/orders/OrderForm';
import Modal from '../components/common/Modal';
import { Plus } from 'lucide-react';

const Pedidos: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();

  const handleSubmit = (orderData: Omit<Order, 'id'>) => {
    if (editingOrder) {
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? { ...orderData, id: order.id } : order
      ));
    } else {
      setOrders([...orders, { ...orderData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingOrder(undefined);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Orçamento
        </button>
      </div>

      <OrderList
        orders={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(undefined);
        }}
        title={editingOrder ? "Editar Orçamento" : "Novo Orçamento"}
      >
        <OrderForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingOrder(undefined);
          }}
          initialData={editingOrder}
        />
      </Modal>
    </div>
  );
};

export default Pedidos;