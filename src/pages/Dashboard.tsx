import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer 
} from 'recharts';
import { Calendar, MapPin, Loader } from 'lucide-react';
import { OrderService } from '../services/firebase/order.service';
import { formatCurrency } from '../utils/currency';
import OrderMap from '../components/orders/OrderMap';

const STATUS_MAP: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  canceled: 'Cancelado'
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [selectedState, setSelectedState] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalValue: 0,
    averageTicket: 0,
    ordersByMonth: [],
    ordersByStatus: [],
    ordersByState: [],
    orders: []
  });

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await OrderService.getDashboardData(
        new Date(dateRange.start),
        new Date(dateRange.end)
      );

      // Filtrar por estado se necessário
      if (selectedState !== 'todos') {
        data.orders = data.orders.filter(order => order.clientState === selectedState);
        
        // Recalcular totais após filtro
        data.totalOrders = data.orders.length;
        data.totalValue = data.orders.reduce((sum, order) => 
          order.status === 'approved' ? sum + order.total : sum, 0);
        data.averageTicket = data.totalOrders > 0 ? data.totalValue / data.totalOrders : 0;
      }

      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            />
            <span>até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="todos">Todos os Estados</option>
              {dashboardData.ordersByState.map((item: any) => (
                <option key={item.state} value={item.state}>
                  {item.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total de Orçamentos</h3>
          <div className="text-3xl font-bold text-indigo-600">{dashboardData.totalOrders}</div>
          <div className="text-sm text-gray-500">No período selecionado</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor Total</h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(dashboardData.totalValue)}
          </div>
          <div className="text-sm text-gray-500">Em orçamentos aprovados</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Médio</h3>
          <div className="text-3xl font-bold text-amber-600">
            {formatCurrency(dashboardData.averageTicket)}
          </div>
          <div className="text-sm text-gray-500">Por orçamento</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
          <div className="space-y-2">
            {dashboardData.ordersByStatus.map((status: any) => (
              <div key={status.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{STATUS_MAP[status.name]}</span>
                <span className="text-sm font-medium text-gray-900">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orçamentos por Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#4F46E5" 
                  name="Valor Total" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Estado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.ordersByState}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4F46E5" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Orçamentos</h3>
        <div className="h-[600px]">
          <OrderMap orders={dashboardData.orders} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;