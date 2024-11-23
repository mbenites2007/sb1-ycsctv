import { collection, doc, getDocs, writeBatch, query, orderBy, Timestamp, getDoc, where, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types';

export class OrderService {
  static async getAllOrders() {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(ordersRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(ordersQuery);

      const orders = snapshot.docs
        .filter(doc => doc.id !== 'metadata' && !doc.data().deleted)
        .map(doc => {
          const data = doc.data();
          // Converter a data corretamente
          const date = data.date instanceof Timestamp ? 
            data.date.toDate() : 
            new Date(data.date || Date.now());

          return {
            id: doc.id,
            ...data,
            date: date.toISOString().split('T')[0], // Formatar como YYYY-MM-DD
            status: data.status || 'draft',
            total: data.total || 0
          };
        });

      return orders;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  static async getDashboardData(startDate: Date, endDate: Date) {
    try {
      const orders = await this.getAllOrders();

      // Filtrar por data
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });

      // Calcular totais
      const totalOrders = filteredOrders.length;
      const approvedOrders = filteredOrders.filter(order => order.status === 'approved');
      const totalValue = approvedOrders.reduce((sum, order) => sum + order.total, 0);
      const averageTicket = totalOrders > 0 ? totalValue / totalOrders : 0;

      // Agrupar por status
      const ordersByStatus = filteredOrders.reduce((acc, order) => {
        const status = order.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Agrupar por mês
      const ordersByMonth = filteredOrders.reduce((acc, order) => {
        const month = new Date(order.date).toLocaleString('pt-BR', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { count: 0, total: 0 };
        }
        acc[month].count++;
        acc[month].total += order.total || 0;
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      // Agrupar por estado
      const ordersByState = filteredOrders.reduce((acc, order) => {
        const state = order.clientState || 'N/A';
        if (!acc[state]) {
          acc[state] = { state, value: 0 };
        }
        acc[state].value++;
        return acc;
      }, {} as Record<string, { state: string; value: number }>);

      return {
        totalOrders,
        totalValue,
        averageTicket,
        ordersByStatus: Object.entries(ordersByStatus).map(([name, value]) => ({
          name,
          value
        })),
        ordersByMonth: Object.entries(ordersByMonth).map(([month, data]) => ({
          month,
          ...data
        })),
        ordersByState: Object.values(ordersByState),
        orders: filteredOrders
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      throw error;
    }
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const ordersRef = collection(db, 'orders');
      
      // Gerar código sequencial
      const counterRef = doc(db, 'counters', 'orders');
      const newOrder = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCounter = counterDoc.exists() ? counterDoc.data().current : 0;
        const nextCounter = currentCounter + 1;
        
        // Atualizar contador
        transaction.set(counterRef, { current: nextCounter }, { merge: true });
        
        // Criar novo orçamento
        const newOrderRef = doc(ordersRef);
        const orderDoc = {
          ...orderData,
          code: `${nextCounter.toString().padStart(6, '0')}`,
          date: Timestamp.fromDate(new Date(orderData.date)), // Converter para Timestamp
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          deleted: false
        };
        
        transaction.set(newOrderRef, orderDoc);
        return { id: newOrderRef.id, ...orderDoc };
      });

      return newOrder;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  static async updateOrder(orderId: string, orderData: Partial<Order>) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const orderRef = doc(db, 'orders', orderId);
      
      // Converter a data para Timestamp se existir
      const dataToUpdate = {
        ...orderData,
        date: orderData.date ? Timestamp.fromDate(new Date(orderData.date)) : undefined,
        updatedAt: Timestamp.now()
      };

      await setDoc(orderRef, dataToUpdate, { merge: true });

      return {
        id: orderId,
        ...orderData
      };
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  static async deleteOrder(orderId: string) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, {
        deleted: true,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw error;
    }
  }

  static async deleteAllOrders() {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        if (doc.id !== 'metadata') {
          batch.update(doc.ref, { 
            deleted: true,
            updatedAt: Timestamp.now()
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Erro ao excluir orçamentos:', error);
      throw error;
    }
  }
}