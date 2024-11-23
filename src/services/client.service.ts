import { prisma } from '../lib/prisma';
import type { Client } from '@prisma/client';

export class ClientService {
  static async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.client.create({ data });
  }

  static async findAll() {
    return prisma.client.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });
  }

  static async update(id: string, data: Partial<Client>) {
    return prisma.client.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.client.delete({
      where: { id }
    });
  }
}