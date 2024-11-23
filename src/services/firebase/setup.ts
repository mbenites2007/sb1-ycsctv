import { doc, setDoc, collection, writeBatch, getDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';

const DEFAULT_SERVICES = [
  {
    code: '1',
    title: 'Serviço de Cobertura Aerofotogramétrica',
    description: 'Serviço de Cobertura Aerofotogramétrica',
    unitPrice: 0,
    subServices: [
      {
        code: '1.1',
        description: 'Área até 100 km²',
        unit: 'km²',
        unitPrice: 350.00
      },
      {
        code: '1.2',
        description: 'Área de 101 a 200 km²',
        unit: 'km²',
        unitPrice: 300.00
      },
      {
        code: '1.3',
        description: 'Área de 201 a 500 km²',
        unit: 'km²',
        unitPrice: 250.00
      },
      {
        code: '1.4',
        description: 'Área acima de 501 km²',
        unit: 'km²',
        unitPrice: 200.00
      }
    ]
  }
];

export async function setupInitialData() {
  try {
    console.log('Iniciando configuração do sistema...');

    // 1. Criar grupo PREFEITURA se não existir
    const groupsRef = collection(db, 'serviceGroups');
    const prefQuery = query(groupsRef, where('code', '==', 'PREF'));
    const prefSnapshot = await getDocs(prefQuery);

    let prefGroupId: string;

    if (prefSnapshot.empty) {
      const newGroupRef = doc(groupsRef);
      prefGroupId = newGroupRef.id;
      
      await setDoc(newGroupRef, {
        code: 'PREF',
        name: 'PREFEITURA',
        description: 'Serviços prestados para prefeituras',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Grupo PREFEITURA criado com sucesso');
    } else {
      prefGroupId = prefSnapshot.docs[0].id;
      console.log('ℹ️ Grupo PREFEITURA já existe');
    }

    // 2. Criar serviços padrão se não existirem
    const servicesRef = collection(db, 'services');
    const servicesQuery = query(servicesRef, where('groupId', '==', prefGroupId));
    const servicesSnapshot = await getDocs(servicesQuery);

    if (servicesSnapshot.empty) {
      console.log('Criando serviços padrão...');
      
      const batch = writeBatch(db);
      
      for (const serviceData of DEFAULT_SERVICES) {
        const newServiceRef = doc(servicesRef);
        const { subServices, ...serviceInfo } = serviceData;
        
        // Criar serviço
        batch.set(newServiceRef, {
          ...serviceInfo,
          groupId: prefGroupId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false
        });

        // Criar subserviços
        const subServicesRef = collection(newServiceRef, 'subServices');
        subServices.forEach(subService => {
          const subServiceRef = doc(subServicesRef);
          batch.set(subServiceRef, {
            ...subService,
            serviceId: newServiceRef.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            allowedFactors: []
          });
        });
      }
      
      await batch.commit();
      console.log('✅ Serviços padrão criados com sucesso');
    } else {
      console.log('ℹ️ Serviços já existem');
    }

    // 3. Criar usuário admin se não existir
    const email = 'admin@exemplo.com';
    const password = 'admin123';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: 'Administrador'
      });

      await setDoc(doc(db, 'users', user.uid), {
        username: 'Administrador',
        email: email,
        accessLevel: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Usuário admin criado com sucesso');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuário admin já existe');
      } else {
        throw error;
      }
    }

    console.log('✅ Configuração do sistema concluída');
  } catch (error) {
    console.error('❌ Erro ao configurar sistema:', error);
    throw error;
  }
}