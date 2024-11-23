import React, { useState, useEffect } from 'react';
import { Order, Client } from '../types';
import OrderList from '../components/orders/OrderList';
import OrderForm from '../components/orders/OrderForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Trash2 } from 'lucide-react';
import { OrderService } from '../services/firebase/order.service';
import { ClientService } from '../services/firebase/client.service';
import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const Orcamentos: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.accessLevel === 'admin';

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    orderId?: string;
    orderCode?: string;
  }>({ isOpen: false, type: 'single' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Iniciando carregamento de dados...');

      // Primeiro carregar os clientes
      const clientsData = await ClientService.getAllClients();
      console.log('Clientes carregados:', clientsData);
      setClients(clientsData);

      // Depois carregar os orçamentos
      const ordersData = await OrderService.getAllOrders();
      console.log('Orçamentos carregados:', ordersData);
      setOrders(ordersData);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      
      if (editingOrder) {
        await OrderService.updateOrder(editingOrder.id, data);
      } else {
        await OrderService.createOrder(data);
      }
      
      await loadData();
      setIsModalOpen(false);
      setEditingOrder(undefined);
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao salvar orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId: string, orderCode: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'single',
      orderId,
      orderCode
    });
  };

  const handleDeleteAll = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'all'
    });
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      
      if (deleteConfirm.type === 'all') {
        await OrderService.deleteAllOrders();
      } else if (deleteConfirm.orderId) {
        await OrderService.deleteOrder(deleteConfirm.orderId);
      }
      
      await loadData();
      setDeleteConfirm({ isOpen: false, type: 'single' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir orçamento(s). Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && orders.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <div className="flex space-x-3">
          {/* Mostrar botão de excluir todos apenas para admin */}
          {isAdmin && orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Excluir Todos
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={clients.length === 0}
            title={clients.length === 0 ? 'Cadastre um cliente primeiro' : ''}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Orçamento
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button
            onClick={loadData}
            className="ml-3 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {clients.length === 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Cadastre pelo menos um cliente antes de criar orçamentos.
        </div>
      )}

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
        size="large"
      >
        <OrderForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingOrder(undefined);
          }}
          initialData={editingOrder}
          clients={clients}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Confirmar Exclusão ${deleteConfirm.type === 'all' ? 'em Massa' : ''}`}
        message={
          deleteConfirm.type === 'all'
            ? 'Tem certeza que deseja excluir TODOS os orçamentos? Esta ação não poderá ser desfeita.'
            : `Tem certeza que deseja excluir o orçamento #${deleteConfirm.orderCode}? Esta ação não poderá ser desfeita.`
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'single' })}
        type="danger"
      />
    </div>
  );
};

export default Orcamentos;