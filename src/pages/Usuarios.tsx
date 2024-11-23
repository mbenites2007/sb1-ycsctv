import React, { useState, useEffect } from 'react';
import { User } from '../types';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus } from 'lucide-react';
import { UserService } from '../services/firebase/user.service';
import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const Usuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId?: string;
    userName?: string;
  }>({ isOpen: false });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedUsers = await UserService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (userData: Omit<User, 'id'> & { password?: string }) => {
    try {
      setIsLoading(true);
      
      if (editingUser) {
        await UserService.updateUser(editingUser.id, userData);
      } else {
        if (!userData.password) {
          throw new Error('Senha é obrigatória para novos usuários');
        }
        await UserService.createUser({
          ...userData,
          password: userData.password
        });
      }
      
      await loadUsers();
      setIsModalOpen(false);
      setEditingUser(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      throw new Error(err.message || 'Erro ao salvar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    // Não permitir editar outros admins
    if (user.accessLevel === 'admin' && currentUser?.id !== user.id) {
      setError('Você não pode editar outros usuários administradores');
      return;
    }
    
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    // Não permitir deletar admins
    if (user?.accessLevel === 'admin') {
      setError('Não é possível excluir usuários administradores');
      return;
    }
    
    if (user) {
      setDeleteConfirm({
        isOpen: true,
        userId: user.id,
        userName: user.username
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.userId) {
      try {
        setIsLoading(true);
        await UserService.deleteUser(deleteConfirm.userId);
        await loadUsers();
      } catch (err: any) {
        console.error('Erro ao excluir usuário:', err);
        setError(err.message || 'Erro ao excluir usuário. Tente novamente.');
      } finally {
        setIsLoading(false);
        setDeleteConfirm({ isOpen: false });
      }
    }
  };

  if (isLoading && users.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button
            onClick={() => {
              setError(null);
              loadUsers();
            }}
            className="ml-3 text-sm underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserId={currentUser?.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(undefined);
        }}
        title={editingUser ? "Editar Usuário" : "Novo Usuário"}
      >
        <UserForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingUser(undefined);
          }}
          initialData={editingUser}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${deleteConfirm.userName}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
        type="danger"
      />
    </div>
  );
};

export default Usuarios;