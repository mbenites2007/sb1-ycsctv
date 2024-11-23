import { collection, doc, setDoc, getDocs, query, where, getDoc, writeBatch, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Service, ServiceGroup } from '../../types';

export class ServiceService {
  static async getAllServiceGroups() {
    try {
      console.log('Iniciando carregamento dos grupos de serviços...');

      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      // Buscar todos os grupos
      const groupsRef = collection(db, 'serviceGroups');
      const groupsSnapshot = await getDocs(groupsRef);

      // Array para armazenar todos os grupos com seus serviços
      const groups = [];
      
      // Processar cada grupo
      for (const groupDoc of groupsSnapshot.docs) {
        if (groupDoc.id === 'metadata') continue;

        const groupData = groupDoc.data();
        
        // Buscar serviços do grupo
        const servicesRef = collection(db, 'services');
        const servicesQuery = query(servicesRef, where('groupId', '==', groupDoc.id));
        const servicesSnapshot = await getDocs(servicesQuery);

        const services = [];
        const processedCodes = new Set(); // Para evitar duplicatas

        // Processar cada serviço do grupo
        for (const serviceDoc of servicesSnapshot.docs) {
          const serviceData = serviceDoc.data();
          
          // Pular serviços excluídos ou duplicados
          if (serviceData.deleted || processedCodes.has(serviceData.code)) {
            continue;
          }

          processedCodes.add(serviceData.code);

          // Buscar subserviços
          const subServicesRef = collection(serviceDoc.ref, 'subServices');
          const subServicesSnapshot = await getDocs(subServicesRef);

          const subServices = subServicesSnapshot.docs.map(subDoc => ({
            id: subDoc.id,
            ...subDoc.data(),
            allowedFactors: subDoc.data().allowedFactors || []
          }));

          services.push({
            id: serviceDoc.id,
            ...serviceData,
            subServices: subServices.sort((a, b) => {
              const codeA = parseInt(a.code.replace(/\D/g, '')) || 0;
              const codeB = parseInt(b.code.replace(/\D/g, '')) || 0;
              return codeA - codeB;
            })
          });
        }

        // Ordenar serviços por código
        const sortedServices = services.sort((a, b) => {
          const codeA = parseInt(a.code.replace(/\D/g, '')) || 0;
          const codeB = parseInt(b.code.replace(/\D/g, '')) || 0;
          return codeA - codeB;
        });

        // Adicionar grupo com seus serviços
        groups.push({
          id: groupDoc.id,
          ...groupData,
          services: sortedServices,
          createdAt: groupData.createdAt?.toDate(),
          updatedAt: groupData.updatedAt?.toDate()
        });
      }

      // Ordenar grupos por código
      const sortedGroups = groups.sort((a, b) => {
        const codeA = a.code.toUpperCase();
        const codeB = b.code.toUpperCase();
        return codeA.localeCompare(codeB);
      });

      return sortedGroups;
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      throw error;
    }
  }

  static async createServiceGroup(groupData: Omit<ServiceGroup, 'id' | 'services'>) {
    try {
      const groupsRef = collection(db, 'serviceGroups');
      const newGroupRef = doc(groupsRef);
      
      await setDoc(newGroupRef, {
        ...groupData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id: newGroupRef.id,
        ...groupData,
        services: []
      };
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  static async updateServiceGroup(groupId: string, groupData: Partial<ServiceGroup>) {
    try {
      const groupRef = doc(db, 'serviceGroups', groupId);
      
      await setDoc(groupRef, {
        ...groupData,
        updatedAt: new Date()
      }, { merge: true });

      return {
        id: groupId,
        ...groupData
      };
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  }

  static async deleteServiceGroup(groupId: string) {
    try {
      // Primeiro excluir todos os serviços do grupo
      const servicesRef = collection(db, 'services');
      const servicesQuery = query(servicesRef, where('groupId', '==', groupId));
      const servicesSnapshot = await getDocs(servicesQuery);

      const batch = writeBatch(db);

      // Marcar todos os serviços como excluídos
      servicesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          deleted: true,
          updatedAt: new Date()
        });
      });

      // Excluir o grupo
      const groupRef = doc(db, 'serviceGroups', groupId);
      batch.delete(groupRef);

      await batch.commit();
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      throw error;
    }
  }

  static async createService(serviceData: Omit<Service, 'id'>) {
    try {
      const servicesRef = collection(db, 'services');
      const newServiceRef = doc(servicesRef);
      
      // Criar o serviço principal
      await setDoc(newServiceRef, {
        groupId: serviceData.groupId,
        code: serviceData.code,
        title: serviceData.title,
        description: serviceData.description,
        unitPrice: serviceData.unitPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Criar subserviços
      const subServicesRef = collection(newServiceRef, 'subServices');
      const batch = writeBatch(db);

      serviceData.subServices.forEach(subService => {
        const subServiceRef = doc(subServicesRef);
        batch.set(subServiceRef, {
          code: subService.code,
          description: subService.description,
          unit: subService.unit,
          unitPrice: subService.unitPrice,
          allowedFactors: subService.allowedFactors || [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await batch.commit();

      return {
        id: newServiceRef.id,
        ...serviceData
      };
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }

  static async updateService(serviceId: string, serviceData: Partial<Service>) {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      
      // Atualizar dados principais do serviço
      const mainData = {
        code: serviceData.code,
        title: serviceData.title,
        description: serviceData.description,
        unitPrice: serviceData.unitPrice,
        updatedAt: new Date()
      };

      await setDoc(serviceRef, mainData, { merge: true });

      // Se houver subserviços para atualizar
      if (serviceData.subServices) {
        const subServicesRef = collection(serviceRef, 'subServices');
        const batch = writeBatch(db);

        // Primeiro, excluir todos os subserviços existentes
        const existingSubServices = await getDocs(subServicesRef);
        existingSubServices.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        // Depois, criar os novos subserviços
        serviceData.subServices.forEach(subService => {
          const subServiceRef = doc(subServicesRef);
          batch.set(subServiceRef, {
            code: subService.code,
            description: subService.description,
            unit: subService.unit,
            unitPrice: subService.unitPrice,
            allowedFactors: subService.allowedFactors || [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });

        await batch.commit();
      }

      return {
        id: serviceId,
        ...serviceData
      };
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  }

  static async deleteService(serviceId: string) {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      
      // Marcar como excluído em vez de deletar
      await setDoc(serviceRef, {
        deleted: true,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      throw error;
    }
  }

  static async deleteAllServices() {
    try {
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      
      const batch = writeBatch(db);
      
      servicesSnapshot.docs.forEach(doc => {
        if (doc.id !== 'metadata') {
          batch.update(doc.ref, { 
            deleted: true,
            updatedAt: new Date()
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Erro ao excluir serviços:', error);
      throw error;
    }
  }
}