import { collection, doc, setDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export class MigrationService {
  static async migrateServicesToGroup() {
    try {
      console.log('Iniciando migração de serviços...');

      // 1. Criar o grupo PREFEITURA
      const groupsRef = collection(db, 'serviceGroups');
      const groupRef = doc(groupsRef);
      
      const groupData = {
        code: 'PREF',
        name: 'PREFEITURA',
        description: 'Serviços prestados para prefeituras',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(groupRef, groupData);
      console.log('Grupo PREFEITURA criado com ID:', groupRef.id);

      // 2. Buscar todos os serviços existentes
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      
      // 3. Migrar cada serviço para o novo grupo
      const batch = writeBatch(db);
      
      servicesSnapshot.docs.forEach(doc => {
        if (doc.id === 'metadata') return;

        const serviceData = doc.data();
        const newServiceRef = doc.ref;
        
        // Adicionar groupId aos dados existentes
        batch.update(newServiceRef, {
          groupId: groupRef.id,
          updatedAt: new Date()
        });
      });

      // 4. Executar o batch
      await batch.commit();

      // 5. Migrar orçamentos existentes
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const ordersBatch = writeBatch(db);

      ordersSnapshot.docs.forEach(doc => {
        if (doc.id === 'metadata') return;

        const orderData = doc.data();
        if (!orderData.subtotal) {
          ordersBatch.update(doc.ref, {
            subtotal: orderData.total,
            discount: 0,
            updatedAt: new Date()
          });
        }
      });

      await ordersBatch.commit();
      
      console.log('Migração concluída com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  }
}