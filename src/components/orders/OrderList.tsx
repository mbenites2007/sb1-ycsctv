import React from 'react';
import { Order } from '../../types';
import { Pencil, Trash2, Download, ChevronDown, ChevronUp, CircleDollarSign, FileSpreadsheet } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../pdf/OrderPDF';
import { exportOrderToExcel } from '../../utils/excel';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string, orderCode: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onEdit, onDelete }) => {
  const [expandedOrders, setExpandedOrders] = React.useState<Set<string>>(new Set());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Filtrar orçamentos excluídos
  const activeOrders = orders.filter(order => !order.deleted);

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <CircleDollarSign className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum orçamento</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece criando um novo orçamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeOrders.map((order) => (
        <div
          key={order.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedOrders.has(order.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">
                      #{order.code}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatDate(order.date)} • {order.clientName}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right mr-4">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </div>
                </div>

                <button
                  onClick={() => exportOrderToExcel(order)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Exportar Excel"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                </button>

                <PDFDownloadLink
                  document={<OrderPDF order={order} />}
                  fileName={`orcamento-${order.code}.pdf`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Exportar PDF"
                >
                  {({ loading }) => (
                    loading ? (
                      <span className="animate-pulse">
                        <Download className="h-5 w-5" />
                      </span>
                    ) : (
                      <Download className="h-5 w-5" />
                    )
                  )}
                </PDFDownloadLink>

                <button
                  onClick={() => onEdit(order)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-5 w-5" />
                </button>

                <button
                  onClick={() => onDelete(order.id, order.code)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {expandedOrders.has(order.id) && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.id}`}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.code} • {item.quantity} {item.unit} x {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-start">
                <div className="text-sm text-gray-600">
                  {order.observations && (
                    <div>
                      <strong>Observações:</strong>
                      <p className="mt-1">{order.observations}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Subtotal: {formatCurrency(order.subtotal)}
                  </div>
                  {order.discount > 0 && (
                    <div className="text-sm text-red-600">
                      Desconto: -{formatCurrency(order.discount)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderList;