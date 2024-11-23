import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Search } from 'lucide-react';
import { ClientService } from '../services/firebase/client.service';
import LoadingScreen from '../components/common/LoadingScreen';

const Clientes: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    clientId?: string;
    clientName?: string;
  }>({ isOpen: false });

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedClients = await ClientService.getAllClients();
      setClients(fetchedClients);
      setFilteredClients(fetchedClients);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredClients(clients);
      return;
    }

    const searchTermLower = term.toLowerCase();
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(searchTermLower) ||
      client.document.toLowerCase().includes(searchTermLower) ||
      client.city.toLowerCase().includes(searchTermLower) ||
      client.state.toLowerCase().includes(searchTermLower)
    );
    setFilteredClients(filtered);
  };

  const handleSubmit = async (clientData: Omit<Client, 'id'>) => {
    try {
      setIsLoading(true);
      if (editingClient) {
        await ClientService.updateClient(editingClient.id, clientData);
      } else {
        await ClientService.createClient(clientData);
      }
      await loadClients();
      setIsModalOpen(false);
      setEditingClient(undefined);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setDeleteConfirm({
        isOpen: true,
        clientId: client.id,
        clientName: client.name
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.clientId) {
      try {
        setIsLoading(true);
        await ClientService.deleteClient(deleteConfirm.clientId);
        await loadClients();
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        setError('Erro ao excluir cliente. Tente novamente.');
      } finally {
        setIsLoading(false);
        setDeleteConfirm({ isOpen: false });
      }
    }
  };

  if (isLoading && clients.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Pesquisar por nome, CNPJ, cidade ou estado..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <ClientList
        clients={filteredClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(undefined);
        }}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        size="large"
      >
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClient(undefined);
          }}
          initialData={editingClient}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${deleteConfirm.clientName}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
        type="danger"
      />
    </div>
  );
};

export default Clientes;