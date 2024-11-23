import React, { useState, useEffect } from 'react';
import { ServiceGroup, Service, Factor } from '../types';
import ServiceList from '../components/services/ServiceList';
import ServiceForm from '../components/services/ServiceForm';
import ServiceGroupForm from '../components/services/ServiceGroupForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, FolderPlus, Search, Trash2 } from 'lucide-react';
import { ServiceService } from '../services/firebase/service.service';
import { FactorService } from '../services/firebase/factor.service';
import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const Servicos: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.accessLevel === 'admin';

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ServiceGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | undefined>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleanConfirm, setCleanConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'service' | 'group';
    id?: string;
    name?: string;
  }>({ isOpen: false, type: 'service' });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [fetchedGroups, fetchedFactors] = await Promise.all([
        ServiceService.getAllServiceGroups(),
        FactorService.getAllFactors()
      ]);
      
      setServiceGroups(fetchedGroups);
      setFilteredGroups(fetchedGroups);
      setFactors(fetchedFactors);
      
      console.log('Dados carregados com sucesso');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredGroups(serviceGroups);
      return;
    }

    const searchTermLower = term.toLowerCase();
    const filtered = serviceGroups.map(group => ({
      ...group,
      services: group.services.filter(service => 
        service.code.toLowerCase().includes(searchTermLower) ||
        service.title.toLowerCase().includes(searchTermLower) ||
        service.description.toLowerCase().includes(searchTermLower) ||
        service.subServices.some(sub => 
          sub.code.toLowerCase().includes(searchTermLower) ||
          sub.description.toLowerCase().includes(searchTermLower)
        )
      )
    })).filter(group => 
      group.services.length > 0 ||
      group.code.toLowerCase().includes(searchTermLower) ||
      group.name.toLowerCase().includes(searchTermLower) ||
      group.description.toLowerCase().includes(searchTermLower)
    );

    setFilteredGroups(filtered);
  };

  const handleSubmitGroup = async (groupData: Omit<ServiceGroup, 'id' | 'services'>) => {
    try {
      setIsLoading(true);
      if (editingGroup) {
        await ServiceService.updateServiceGroup(editingGroup.id, groupData);
      } else {
        await ServiceService.createServiceGroup(groupData);
      }
      await loadData();
      setIsGroupModalOpen(false);
      setEditingGroup(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar grupo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      setIsLoading(true);
      if (editingService) {
        await ServiceService.updateService(editingService.id, serviceData);
      } else {
        await ServiceService.createService(serviceData);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingService(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ServiceGroup) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    const service = serviceGroups
      .flatMap(g => g.services)
      .find(s => s.id === serviceId);
    
    if (service) {
      setDeleteConfirm({
        isOpen: true,
        type: 'service',
        id: serviceId,
        name: service.title
      });
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    if (group) {
      setDeleteConfirm({
        isOpen: true,
        type: 'group',
        id: groupId,
        name: group.name
      });
    }
  };

  const handleCleanServices = async () => {
    try {
      setIsLoading(true);
      await ServiceService.deleteAllServices();
      await loadData();
      setCleanConfirm(false);
    } catch (error) {
      console.error('Erro ao limpar serviços:', error);
      setError(error instanceof Error ? error.message : 'Erro ao limpar serviços');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setIsLoading(true);
      if (deleteConfirm.type === 'service') {
        await ServiceService.deleteService(deleteConfirm.id);
      } else {
        await ServiceService.deleteServiceGroup(deleteConfirm.id);
      }
      await loadData();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      setError(err instanceof Error ? err.message : `Erro ao excluir ${deleteConfirm.type === 'service' ? 'serviço' : 'grupo'}`);
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ isOpen: false, type: 'service' });
    }
  };

  if (isLoading && serviceGroups.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <div className="flex space-x-3">
          {/* Mostrar botão de limpar apenas para admin */}
          {isAdmin && serviceGroups.length > 0 && (
            <button
              onClick={() => setCleanConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Limpar Serviços
            </button>
          )}
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Novo Grupo
          </button>
          <button
            onClick={() => {
              if (serviceGroups.length === 0) {
                setError('Crie um grupo primeiro antes de adicionar serviços');
                return;
              }
              setSelectedGroupId(serviceGroups[0].id);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Serviço
          </button>
        </div>
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
            placeholder="Pesquisar por código, nome ou descrição..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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

      <ServiceList
        serviceGroups={filteredGroups}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
        onAddService={(groupId) => {
          setSelectedGroupId(groupId);
          setIsModalOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(undefined);
        }}
        title={editingService ? "Editar Serviço" : "Novo Serviço"}
        size="large"
      >
        <ServiceForm
          onSubmit={handleSubmitService}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingService(undefined);
          }}
          initialData={editingService}
          groupId={selectedGroupId}
          factors={factors}
        />
      </Modal>

      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(undefined);
        }}
        title={editingGroup ? "Editar Grupo" : "Novo Grupo"}
      >
        <ServiceGroupForm
          onSubmit={handleSubmitGroup}
          onCancel={() => {
            setIsGroupModalOpen(false);
            setEditingGroup(undefined);
          }}
          initialData={editingGroup}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Confirmar Exclusão de ${deleteConfirm.type === 'service' ? 'Serviço' : 'Grupo'}`}
        message={`Tem certeza que deseja excluir ${deleteConfirm.type === 'service' ? 'o serviço' : 'o grupo'} "${deleteConfirm.name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'service' })}
        type="danger"
      />

      <ConfirmDialog
        isOpen={cleanConfirm}
        title="Confirmar Limpeza"
        message="Tem certeza que deseja limpar todos os serviços? Esta ação não poderá ser desfeita."
        confirmLabel="Limpar"
        cancelLabel="Cancelar"
        onConfirm={handleCleanServices}
        onCancel={() => setCleanConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default Servicos;