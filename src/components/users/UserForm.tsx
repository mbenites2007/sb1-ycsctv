import React, { useState } from 'react';
import { User } from '../../types';
import InputField from '../common/InputField';
import { UserCircle, Mail, Shield, ToggleLeft } from 'lucide-react';

interface UserFormProps {
  onSubmit: (data: Omit<User, 'id'> & { password?: string; currentPassword?: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
    accessLevel: initialData?.accessLevel || 'standard',
    status: initialData?.status || 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Validar senha apenas para novo usuário ou se senha foi preenchida
    if (!initialData?.id) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Senha atual é obrigatória para alterar a senha';
      }
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        
        const userData = {
          username: formData.username,
          email: formData.email,
          accessLevel: formData.accessLevel as 'admin' | 'standard',
          status: formData.status as 'active' | 'inactive',
          ...(formData.password ? { 
            password: formData.password,
            currentPassword: formData.currentPassword 
          } : {})
        };

        await onSubmit(userData);
      } catch (error: any) {
        console.error('Erro ao salvar usuário:', error);
        setErrors({
          submit: error.message || 'Erro ao salvar usuário'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <InputField
        name="username"
        label="Nome de Usuário"
        value={formData.username}
        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
        icon={<UserCircle className="h-5 w-5 text-gray-400" />}
        error={errors.username}
        disabled={isSubmitting}
      />

      <InputField
        type="email"
        name="email"
        label="E-mail"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        error={errors.email}
        disabled={isSubmitting}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Acesso
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="accessLevel"
              value={formData.accessLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="standard">Padrão</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {initialData && (
          <InputField
            type="password"
            name="currentPassword"
            label="Senha Atual"
            value={formData.currentPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
            error={errors.currentPassword}
            disabled={isSubmitting}
          />
        )}

        <InputField
          type="password"
          name="password"
          label={initialData ? "Nova Senha (opcional)" : "Senha"}
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          error={errors.password}
          disabled={isSubmitting}
        />

        {(formData.password || !initialData) && (
          <InputField
            type="password"
            name="confirmPassword"
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;