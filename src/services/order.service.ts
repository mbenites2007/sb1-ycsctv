import { prisma } from '../lib/prisma';
import type { Order, OrderItem } from '@prisma/client';

export class OrderService {
  static async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>[] }) {
    const { items, ...orderData } = data;
    
    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items
        }
      },
      include: {
        items: true,
        client: true
      }
    });
  }

  static async findAll() {
    return prisma.order.findMany({
      include: {
        items: {
          include: {
            service: true,
            subService: true
          }
        },
        client: true
      },
      orderBy: { date: 'desc' }
    });
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            service: true,
            subService: true
          }
        },
        client: true
      }
    });
  }

  static async update(id: string, data: Partial<Order> & { items?: Omit<OrderItem, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>[] }) {
    const { items, ...orderData } = data;

    if (items) {
      // Primeiro remove todos os itens existentes
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });

      // Depois cria os novos itens
      return prisma.order.update({
        where: { id },
        data: {
          ...orderData,
          items: {
            create: items
          }
        },
        include: {
          items: true,
          client: true
        }
      });
    }

    return prisma.order.update({
      where: { id },
      data: orderData,
      include: {
        items: true,
        client: true
      }
    });
  }

  static async delete(id: string) {
    return prisma.order.delete({
      where: { id }
    });
  }

  static async getDashboardData(startDate: Date, endDate: Date) {
    const [
      totalOrders,
      totalValue,
      ordersByStatus,
      ordersByMonth
    ] = await Promise.all([
      // Total de orçamentos no período
      prisma.order.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Valor total dos orçamentos aprovados
      prisma.order.aggregate({
        where: {
          status: 'approved',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          total: true
        }
      }),

      // Distribuição por status
      prisma.order.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true
      }),

      // Orçamentos por mês
      prisma.order.groupBy({
        by: ['date'],
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true,
        _sum: {
          total: true
        }
      })
    ]);

    return {
      totalOrders,
      totalValue: totalValue._sum.total || 0,
      averageTicket: totalValue._sum.total ? totalValue._sum.total / totalOrders : 0,
      ordersByStatus,
      ordersByMonth
    };
  }
}