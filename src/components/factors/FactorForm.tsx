import React, { useState } from 'react';
import { Factor, FactorSubItem } from '../../types';
import InputField from '../common/InputField';
import { Package, CircleDollarSign, Plus, Trash2 } from 'lucide-react';

interface FactorFormProps {
  onSubmit: (data: Omit<Factor, 'id' | 'cod_fator'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Factor;
}

const FactorForm: React.FC<FactorFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    descricao_fator: initialData?.descricao_fator || '',
    subitems: initialData?.subitems || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao_fator.trim()) {
      newErrors.descricao_fator = 'Descrição é obrigatória';
    }

    if (formData.subitems.length === 0) {
      newErrors.subitems = 'Adicione pelo menos um subitem';
    }

    formData.subitems.forEach((subitem, index) => {
      if (!subitem.descricao_subitem.trim()) {
        newErrors[`subitem.${index}.descricao_subitem`] = 'Descrição é obrigatória';
      }
      if (subitem.valor < 0) {
        newErrors[`subitem.${index}.valor`] = 'Valor não pode ser negativo';
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
        console.error('Erro ao salvar fator:', error);
        setErrors({
          submit: error.message || 'Erro ao salvar fator'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddSubitem = () => {
    const newSubService: FactorSubItem = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cod_subitem: formData.subitems.length + 1,
      descricao_subitem: '',
      valor: 0,
      fator_id: initialData?.id || ''
    };

    setFormData(prev => ({
      ...prev,
      subitems: [...prev.subitems, newSubService]
    }));
  };

  const handleRemoveSubitem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subitems: prev.subitems.filter((_, i) => i !== index)
    }));
  };

  const handleSubitemChange = (index: number, field: keyof FactorSubItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      subitems: prev.subitems.map((subitem, i) => {
        if (i === index) {
          if (field === 'valor') {
            const numValue = value.toString().replace(',', '.');
            return {
              ...subitem,
              [field]: parseFloat(numValue) || 0
            };
          }
          return {
            ...subitem,
            [field]: value
          };
        }
        return subitem;
      })
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Informações do Fator
          </h3>
        </div>
        
        <div className="max-w-2xl">
          <InputField
            name="descricao_fator"
            label="Descrição do Fator"
            value={formData.descricao_fator}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao_fator: e.target.value }))}
            placeholder="Digite a descrição do fator"
            error={errors.descricao_fator}
            disabled={isSubmitting}
            className="text-lg"
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CircleDollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Valores</h3>
              <p className="text-sm text-gray-500 mt-1">
                Adicione os valores do fator com suas respectivas descrições
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddSubitem}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Valor
          </button>
        </div>

        {errors.subitems && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-r-lg">
            <p className="text-sm">{errors.subitems}</p>
          </div>
        )}

        <div className="space-y-4">
          {formData.subitems.map((subitem, index) => (
            <div 
              key={subitem.id || index} 
              className="group relative bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <InputField
                    label="Descrição"
                    value={subitem.descricao_subitem}
                    onChange={(e) => handleSubitemChange(index, 'descricao_subitem', e.target.value)}
                    placeholder="Digite a descrição do valor"
                    error={errors[`subitem.${index}.descricao_subitem`]}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-3">
                  <InputField
                    label="Valor"
                    type="number"
                    step="any"
                    value={subitem.valor || ''}
                    onChange={(e) => handleSubitemChange(index, 'valor', e.target.value)}
                    placeholder="0.00"
                    error={errors[`subitem.${index}.valor`]}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-1 flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveSubitem(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    title="Remover valor"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {formData.subitems.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <CircleDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum valor</h3>
              <p className="mt-1 text-sm text-gray-500">Clique no botão acima para adicionar um valor</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default FactorForm;