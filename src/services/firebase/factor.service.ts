import { collection, doc, setDoc, getDocs, query, orderBy, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Factor } from '../../types/factor';

export class FactorService {
  static async createFactor(factorData: Omit<Factor, 'id' | 'cod_fator'>) {
    try {
      const factorsRef = collection(db, 'factors');
      const counterRef = doc(db, 'counters', 'factors');

      const newFactor = await runTransaction(db, async (transaction) => {
        // Get current counter value
        const counterDoc = await transaction.get(counterRef);
        const currentCounter = counterDoc.exists() ? counterDoc.data().current : 0;
        const nextCounter = currentCounter + 1;

        // Update counter
        transaction.set(counterRef, { current: nextCounter }, { merge: true });

        // Create new factor document
        const newFactorRef = doc(factorsRef);
        const cod_fator = nextCounter;

        // Create sub-items with auto-generated codes
        const subitems = factorData.subitems.map((subitem, index) => ({
          id: `${newFactorRef.id}-subitem-${index + 1}`,
          cod_subitem: (cod_fator * 100) + (index + 1),
          descricao_subitem: subitem.descricao_subitem,
          valor: Number(subitem.valor),
          fator_id: newFactorRef.id
        }));

        const newFactorDoc = {
          id: newFactorRef.id,
          cod_fator,
          descricao_fator: factorData.descricao_fator,
          subitems,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        transaction.set(newFactorRef, newFactorDoc);
        return newFactorDoc;
      });

      return newFactor;
    } catch (error) {
      console.error('Erro ao criar fator:', error);
      throw new Error('Falha ao criar fator. Por favor, tente novamente.');
    }
  }

  static async getAllFactors() {
    try {
      const factorsRef = collection(db, 'factors');
      const q = query(factorsRef, orderBy('cod_fator'));
      const snapshot = await getDocs(q);
      
      const factors = snapshot.docs
        .filter(doc => doc.id !== 'metadata')
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            cod_fator: data.cod_fator,
            descricao_fator: data.descricao_fator,
            subitems: data.subitems.map((subitem: any) => ({
              id: subitem.id || `${doc.id}-subitem-${subitem.cod_subitem}`,
              cod_subitem: subitem.cod_subitem,
              descricao_subitem: subitem.descricao_subitem,
              valor: Number(subitem.valor),
              fator_id: doc.id
            }))
          };
        })
        .sort((a, b) => a.cod_fator - b.cod_fator);

      return factors;
    } catch (error) {
      console.error('Erro ao carregar fatores:', error);
      throw new Error('Erro ao carregar fatores. Por favor, tente novamente.');
    }
  }

  static async updateFactor(factorId: string, factorData: Partial<Factor>) {
    try {
      const factorRef = doc(db, 'factors', factorId);

      const updateData = {
        descricao_fator: factorData.descricao_fator,
        subitems: factorData.subitems?.map((subitem, index) => ({
          id: subitem.id || `${factorId}-subitem-${index + 1}`,
          cod_subitem: subitem.cod_subitem,
          descricao_subitem: subitem.descricao_subitem,
          valor: Number(subitem.valor),
          fator_id: factorId
        })),
        updatedAt: new Date()
      };

      await setDoc(factorRef, updateData, { merge: true });

      return {
        id: factorId,
        ...factorData
      };
    } catch (error) {
      console.error('Erro ao atualizar fator:', error);
      throw new Error('Falha ao atualizar fator. Por favor, tente novamente.');
    }
  }

  static async deleteFactor(factorId: string) {
    try {
      const factorRef = doc(db, 'factors', factorId);
      await deleteDoc(factorRef);
    } catch (error) {
      console.error('Erro ao excluir fator:', error);
      throw new Error('Falha ao excluir fator. Por favor, tente novamente.');
    }
  }
}