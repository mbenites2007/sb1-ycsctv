import { collection, getDocs, query, orderBy, doc, setDoc, where, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Client } from '../../types';

export class ClientService {
  static async getAllClients(): Promise<Client[]> {
    try {
      console.log('Iniciando busca de clientes...');

      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      // Simplificar a query para não precisar de índice composto
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, orderBy('name'));

      const snapshot = await getDocs(q);
      
      // Filtrar clientes excluídos na memória
      const clients = snapshot.docs
        .filter(doc => doc.id !== 'metadata' && !doc.data().deleted)
        .map(doc => this.mapClientData(doc.id, doc.data()));

      console.log(`${clients.length} clientes encontrados`);
      return clients;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      if (error instanceof Error) {
        throw new Error(`Erro ao carregar clientes: ${error.message}`);
      }
      throw new Error('Erro ao carregar clientes. Por favor, tente novamente.');
    }
  }

  private static mapClientData(id: string, data: DocumentData): Client {
    return {
      id,
      name: data.name || '',
      document: this.formatCNPJ(data.document || ''),
      email: data.email || '',
      phone: this.formatPhone(data.phone || ''),
      street: data.street || '',
      number: data.number || '',
      complement: data.complement || '',
      neighborhood: data.neighborhood || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipCode || '',
      mayor: data.mayor || '',
      party: data.party || '',
      mayorPhone: data.mayorPhone ? this.formatPhone(data.mayorPhone) : '',
      clientFactors: data.clientFactors || [],
      observations: data.observations || ''
    };
  }

  static async createClient(clientData: Omit<Client, 'id'>) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      // Verificar documento duplicado
      const existingClient = await this.getClientByDocument(clientData.document);
      if (existingClient) {
        throw new Error('Já existe um cliente com este documento');
      }

      // Criar novo cliente
      const clientsRef = collection(db, 'clients');
      const newClientRef = doc(clientsRef);
      
      const newClient = {
        ...clientData,
        document: clientData.document.replace(/\D/g, ''),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      await setDoc(newClientRef, newClient);
      console.log('Cliente criado com sucesso:', newClientRef.id);

      return {
        id: newClientRef.id,
        ...clientData
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      if (error instanceof Error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }
      throw new Error('Erro ao criar cliente. Por favor, tente novamente.');
    }
  }

  static async updateClient(clientId: string, clientData: Partial<Client>) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const clientRef = doc(db, 'clients', clientId);
      
      const updateData = {
        ...clientData,
        document: clientData.document ? clientData.document.replace(/\D/g, '') : undefined,
        updatedAt: new Date()
      };

      await setDoc(clientRef, updateData, { merge: true });
      console.log('Cliente atualizado com sucesso:', clientId);

      return {
        id: clientId,
        ...clientData
      };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      if (error instanceof Error) {
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      }
      throw new Error('Erro ao atualizar cliente. Por favor, tente novamente.');
    }
  }

  static async deleteClient(clientId: string) {
    try {
      if (!db) {
        throw new Error('Conexão com o banco de dados não inicializada');
      }

      const clientRef = doc(db, 'clients', clientId);
      await setDoc(clientRef, {
        deleted: true,
        updatedAt: new Date()
      }, { merge: true });

      console.log('Cliente excluído com sucesso:', clientId);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      if (error instanceof Error) {
        throw new Error(`Erro ao excluir cliente: ${error.message}`);
      }
      throw new Error('Erro ao excluir cliente. Por favor, tente novamente.');
    }
  }

  private static async getClientByDocument(document: string) {
    const cleanDocument = document.replace(/\D/g, '');
    const q = query(collection(db, 'clients'), where('document', '==', cleanDocument));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0];
  }

  private static formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    if (!cleaned) return '';
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  private static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return '';
    return cleaned.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1)$2-$3');
  }
}