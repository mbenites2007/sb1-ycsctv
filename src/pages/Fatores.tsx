import React, { useState, useEffect } from 'react';
import { Factor } from '../types/factor';
import FactorList from '../components/factors/FactorList';
import FactorForm from '../components/factors/FactorForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus } from 'lucide-react';
import { FactorService } from '../services/firebase/factor.service';
import LoadingScreen from '../components/common/LoadingScreen';

const Fatores: React.FC = () => {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<Factor | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    factorId?: string;
    factorDescription?: string;
  }>({ isOpen: false });

  const loadFactors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedFactors = await FactorService.getAllFactors();
      setFactors(fetchedFactors);
    } catch (err) {
      console.error('Erro ao carregar fatores:', err);
      setError('Erro ao carregar fatores. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleSubmit = async (factorData: Omit<Factor, 'cod_fator'>) => {
    try {
      setIsLoading(true);
      if (editingFactor) {
        await FactorService.updateFactor(editingFactor.id, factorData);
      } else {
        await FactorService.createFactor(factorData);
      }
      await loadFactors();
      setIsModalOpen(false);
      setEditingFactor(undefined);
    } catch (err) {
      console.error('Erro ao salvar fator:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (factor: Factor) => {
    setEditingFactor(factor);
    setIsModalOpen(true);
  };

  const handleDelete = (factor: Factor) => {
    setDeleteConfirm({
      isOpen: true,
      factorId: factor.id,
      factorDescription: factor.descricao_fator
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.factorId) {
      try {
        setIsLoading(true);
        await FactorService.deleteFactor(deleteConfirm.factorId);
        await loadFactors();
      } catch (err) {
        console.error('Erro ao excluir fator:', err);
        setError('Erro ao excluir fator. Tente novamente.');
      } finally {
        setIsLoading(false);
        setDeleteConfirm({ isOpen: false });
      }
    }
  };

  if (isLoading && factors.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fatores</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Fator
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <FactorList
        factors={factors}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFactor(undefined);
        }}
        title={editingFactor ? "Editar Fator" : "Novo Fator"}
      >
        <FactorForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingFactor(undefined);
          }}
          initialData={editingFactor}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o fator "${deleteConfirm.factorDescription}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
        type="danger"
      />
    </div>
  );
};

export default Fatores;