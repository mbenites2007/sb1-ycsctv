import React, { useState } from 'react';
import { Service, SubService, Factor } from '../../types';
import InputField from '../common/InputField';
import CurrencyInput from '../common/CurrencyInput';
import { Package, CircleDollarSign, Plus, Trash2, X } from 'lucide-react';
import SubServiceFactorSelect from './SubServiceFactorSelect';

// Lista base de unidades de medida
const UNIDADES_MEDIDA = [
  'Horas',
  'km',
  'km²',
  'Licença',
  'Mês',
  'Serviço',
  'Unidade Imobiliária',
  'Unidade Mobiliária'
].sort();

interface ServiceFormProps {
  onSubmit: (data: Omit<Service, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Service;
  groupId: string;
  factors: Factor[];
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, onCancel, initialData, groupId, factors }) => {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    groupId: groupId,
    code: initialData?.code || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    unitPrice: initialData?.unitPrice || 0,
    subServices: initialData?.subServices.map(sub => ({
      ...sub,
      allowedFactors: sub.allowedFactors || []
    })) || []
  });

  // Estado para controlar unidades customizadas
  const [customUnits, setCustomUnits] = useState<string[]>(() => {
    // Inicializar com unidades customizadas dos subserviços existentes
    const existingUnits = initialData?.subServices
      .map(sub => sub.unit)
      .filter(unit => !UNIDADES_MEDIDA.includes(unit)) || [];
    return [...new Set(existingUnits)];
  });

  const [showUnitInput, setShowUnitInput] = useState<number | null>(null);
  const [newUnit, setNewUnit] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combinar unidades padrão com unidades customizadas
  const allUnits = [...UNIDADES_MEDIDA, ...customUnits].sort();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.subServices.length === 0) {
      newErrors.subServices = 'Adicione pelo menos um subserviço';
    }

    formData.subServices.forEach((subService, index) => {
      if (!subService.code.trim()) {
        newErrors[`subService.${index}.code`] = 'Código é obrigatório';
      }
      if (!subService.description.trim()) {
        newErrors[`subService.${index}.description`] = 'Descrição é obrigatória';
      }
      if (!subService.unit.trim()) {
        newErrors[`subService.${index}.unit`] = 'Unidade é obrigatória';
      }
      if (subService.unitPrice <= 0) {
        newErrors[`subService.${index}.unitPrice`] = 'Preço deve ser maior que zero';
      }
    });

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
        console.error('Erro ao salvar serviço:', error);
        setErrors({
          submit: error.message || 'Erro ao salvar serviço'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddSubService = () => {
    const maxCode = formData.subServices.reduce((max, service) => {
      const num = parseInt(service.code.replace(/\D/g, '')) || 0;
      return num > max ? num : max;
    }, 0);

    const newCode = `${maxCode + 1}`;

    const newSubService: SubService = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: newCode,
      description: '',
      unit: '',
      unitPrice: 0,
      serviceId: initialData?.id || '',
      allowedFactors: []
    };

    setFormData(prev => ({
      ...prev,
      subServices: [...prev.subServices, newSubService]
    }));
  };

  const handleRemoveSubService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subServices: prev.subServices.filter((_, i) => i !== index)
    }));
  };

  const handleSubServiceChange = (index: number, field: keyof SubService, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      subServices: prev.subServices.map((subService, i) => {
        if (i === index) {
          if (field === 'allowedFactors') {
            return {
              ...subService,
              allowedFactors: factors.filter(f => (value as string[]).includes(f.id))
            };
          }
          if (field === 'unitPrice') {
            const numValue = value.toString().replace(',', '.');
            return {
              ...subService,
              [field]: parseFloat(numValue) || 0
            };
          }
          return {
            ...subService,
            [field]: value
          };
        }
        return subService;
      })
    }));
  };

  const handleAddUnit = () => {
    if (newUnit.trim() && !allUnits.includes(newUnit.trim())) {
      setCustomUnits(prev => [...prev, newUnit.trim()]);
      
      // Se estiver adicionando unidade para um subserviço específico,
      // já seleciona a nova unidade para ele
      if (showUnitInput !== null) {
        handleSubServiceChange(showUnitInput, 'unit', newUnit.trim());
      }
      
      setNewUnit('');
      setShowUnitInput(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <InputField
            name="code"
            label="Código"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Código"
            icon={<Package className="h-5 w-5 text-gray-400" />}
            error={errors.code}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-10">
          <InputField
            name="title"
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título do serviço"
            error={errors.title}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-12">
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição detalhada do serviço"
            rows={3}
            className={`block w-full px-3 py-2 border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Subserviços</h4>
          </div>
          <button
            type="button"
            onClick={handleAddSubService}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {errors.subServices && (
          <p className="text-sm text-red-600 mb-4">{errors.subServices}</p>
        )}

        <div className="space-y-4">
          {formData.subServices.map((subService, index) => (
            <div key={subService.id || index} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-start">
              <div className="col-span-1">
                <InputField
                  value={subService.code}
                  onChange={(e) => handleSubServiceChange(index, 'code', e.target.value)}
                  placeholder="Código"
                  error={errors[`subService.${index}.code`]}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-span-5">
                <InputField
                  value={subService.description}
                  onChange={(e) => handleSubServiceChange(index, 'description', e.target.value)}
                  placeholder="Descrição do subserviço"
                  error={errors[`subService.${index}.description`]}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-span-2">
                <div className="relative">
                  {showUnitInput === index ? (
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="Nova unidade"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddUnit}
                        className="px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        title="Adicionar unidade"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUnitInput(null)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <select
                        value={subService.unit}
                        onChange={(e) => handleSubServiceChange(index, 'unit', e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          errors[`subService.${index}.unit`] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                        disabled={isSubmitting}
                      >
                        <option value="">Unidade</option>
                        {allUnits.map((unidade) => (
                          <option key={unidade} value={unidade} className="py-1">
                            {unidade}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowUnitInput(index)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                        title="Nova unidade"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {errors[`subService.${index}.unit`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`subService.${index}.unit`]}</p>
                  )}
                </div>
              </div>

              <div className="col-span-3">
                <CurrencyInput
                  value={subService.unitPrice}
                  onChange={(value) => handleSubServiceChange(index, 'unitPrice', value)}
                  placeholder="Preço unitário"
                  icon={<CircleDollarSign className="h-4 w-4 text-gray-400" />}
                  error={errors[`subService.${index}.unitPrice`]}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveSubService(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="col-span-12 mt-2">
                <SubServiceFactorSelect
                  factors={factors}
                  selectedFactorIds={subService.allowedFactors?.map(f => f.id) || []}
                  onChange={(factorIds) => handleSubServiceChange(index, 'allowedFactors', factorIds)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}

          {formData.subServices.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Package className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Nenhum subserviço adicionado</p>
              <p className="text-xs text-gray-400">Clique no botão acima para adicionar</p>
            </div>
          )}
        </div>
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

export default ServiceForm;