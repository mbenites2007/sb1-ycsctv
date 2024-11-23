import React from 'react';
import { Factor } from '../../types';
import Modal from '../common/Modal';

interface OrderFormFactorModalProps {
  isOpen: boolean;
  factors: Factor[];
  onClose: () => void;
  onFactorSelect: (factor: Factor) => void;
  onNoFactor: () => void;
}

const OrderFormFactorModal: React.FC<OrderFormFactorModalProps> = ({
  isOpen,
  factors,
  onClose,
  onFactorSelect,
  onNoFactor
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fator de Correção"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">
            Deseja aplicar um fator de correção?
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            O fator será aplicado aos valores unitários dos serviços selecionados
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {factors.map(factor => (
            <button
              key={factor.id}
              onClick={() => onFactorSelect(factor)}
              className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{factor.description}</div>
                  <div className="text-sm text-gray-500">
                    Acréscimo de {factor.value}% sobre o valor base
                  </div>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {factor.value}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onNoFactor}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Não aplicar fator
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderFormFactorModal;