import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import InputField from '../common/InputField';
import MaskedInput from '../common/MaskedInput';
import { User, Mail, Phone, MapPin, FileText, Building2, Users, PhoneCall, Percent } from 'lucide-react';
import { FactorService } from '../../services/firebase/factor.service';

interface ClientFormProps {
  onSubmit: (data: Omit<Client, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Client;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    document: initialData?.document || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    mayor: initialData?.mayor || '',
    party: initialData?.party || '',
    mayorPhone: initialData?.mayorPhone || '',
    clientFactors: initialData?.clientFactors || [],
    observations: initialData?.observations || ''
  });

  const [factors, setFactors] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFactors, setIsLoadingFactors] = useState(true);

  useEffect(() => {
    const loadFactors = async () => {
      try {
        const fetchedFactors = await FactorService.getAllFactors();
        setFactors(fetchedFactors);
      } catch (error) {
        console.error('Erro ao carregar fatores:', error);
      } finally {
        setIsLoadingFactors(false);
      }
    };

    loadFactors();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.document.trim()) {
      newErrors.document = 'CNPJ é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await onSubmit(formData);
      } catch (error: any) {
        console.error('Erro ao salvar cliente:', error);
        setErrors({
          submit: error.message || 'Erro ao salvar cliente'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFactorChange = (factorId: string, subItemId: string) => {
    setFormData(prev => {
      const newFactors = [...prev.clientFactors];
      const existingIndex = newFactors.findIndex(f => f.factorId === factorId);
      
      if (subItemId === '') {
        if (existingIndex >= 0) {
          newFactors.splice(existingIndex, 1);
        }
      } else {
        const newFactor = {
          factorId,
          subItemId
        };

        if (existingIndex >= 0) {
          newFactors[existingIndex] = newFactor;
        } else {
          newFactors.push(newFactor);
        }
      }

      return {
        ...prev,
        clientFactors: newFactors
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <InputField
            name="name"
            label="Nome"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome do cliente"
            icon={<User className="h-5 w-5 text-gray-400" />}
            error={errors.name}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <MaskedInput
            name="document"
            label="CNPJ"
            value={formData.document}
            onChange={handleChange}
            placeholder="00.000.000/0000-00"
            mask="cnpj"
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            error={errors.document}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-8">
          <InputField
            type="email"
            name="email"
            label="E-mail"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <MaskedInput
            name="phone"
            label="Telefone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 0000-0000"
            mask="phone"
            icon={<Phone className="h-5 w-5 text-gray-400" />}
            error={errors.phone}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-8">
          <InputField
            name="street"
            label="Endereço"
            value={formData.street}
            onChange={handleChange}
            placeholder="Rua, Avenida, etc"
            icon={<MapPin className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="number"
            label="Número"
            value={formData.number}
            onChange={handleChange}
            placeholder="123"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="complement"
            label="Complemento"
            value={formData.complement}
            onChange={handleChange}
            placeholder="Sala, Andar, etc"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="neighborhood"
            label="Bairro"
            value={formData.neighborhood}
            onChange={handleChange}
            placeholder="Centro"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="zipCode"
            label="CEP"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="00000-000"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-8">
          <InputField
            name="city"
            label="Cidade"
            value={formData.city}
            onChange={handleChange}
            placeholder="Nome da cidade"
            icon={<Building2 className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="state"
            label="Estado"
            value={formData.state}
            onChange={handleChange}
            placeholder="UF"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="mayor"
            label="Prefeito"
            value={formData.mayor}
            onChange={handleChange}
            placeholder="Nome do prefeito"
            icon={<Users className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <InputField
            name="party"
            label="Partido"
            value={formData.party}
            onChange={handleChange}
            placeholder="Sigla do partido"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-4">
          <MaskedInput
            name="mayorPhone"
            label="Telefone do Prefeito"
            value={formData.mayorPhone}
            onChange={handleChange}
            placeholder="(00) 0000-0000"
            mask="phone"
            icon={<PhoneCall className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-12">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Observações adicionais..."
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center space-x-2 mb-4">
          <Percent className="h-5 w-5 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-900">Fatores de Correção</h4>
        </div>
        
        {isLoadingFactors ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando fatores...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {factors.map(factor => {
              const selectedFactor = formData.clientFactors.find(f => f.factorId === factor.id);
              
              return (
                <div key={factor.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {factor.descricao_fator}
                  </label>
                  <select
                    value={selectedFactor?.subItemId || ''}
                    onChange={(e) => handleFactorChange(factor.id, e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um valor</option>
                    {factor.subitems.map(subItem => (
                      <option key={subItem.id} value={subItem.id}>
                        {subItem.descricao_subitem} ({subItem.valor})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
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

export default ClientForm;