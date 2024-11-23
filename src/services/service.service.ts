import { prisma } from '../lib/prisma';
import type { Service, SubService } from '@prisma/client';

export class ServiceService {
  static async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.service.create({ data });
  }

  static async createSubService(serviceId: string, data: Omit<SubService, 'id' | 'serviceId' | 'createdAt' | 'updatedAt'>) {
    return prisma.subService.create({
      data: {
        ...data,
        serviceId
      }
    });
  }

  static async findAll() {
    return prisma.service.findMany({
      include: {
        subServices: true
      },
      orderBy: { code: 'asc' }
    });
  }

  static async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        subServices: true
      }
    });
  }

  static async update(id: string, data: Partial<Service>) {
    return prisma.service.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.service.delete({
      where: { id }
    });
  }
}