import { doc, setDoc, collection, getDocs, query, where, updateDoc, deleteDoc, orderBy, getDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  updateEmail, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  deleteUser as deleteFirebaseUser,
  getAuth
} from 'firebase/auth';
import { db, auth } from '../../config/firebase';

export interface UserData {
  username: string;
  email: string;
  accessLevel: 'admin' | 'standard';
  status: 'active' | 'inactive';
}

export class UserService {
  static async getAllUsers() {
    try {
      console.log('Buscando todos os usuários...');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email'));
      const snapshot = await getDocs(q);
      
      const users = snapshot.docs
        .filter(doc => doc.id !== 'metadata')
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            username: data.username,
            email: data.email,
            accessLevel: data.accessLevel || 'standard',
            status: data.status || 'active',
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          };
        });

      console.log(`${users.length} usuários encontrados`);
      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw this.handleError(error);
    }
  }

  static async createUser(userData: UserData & { password: string }) {
    try {
      // Verificar se o email já existe
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error(`O email ${userData.email} já está em uso`);
      }

      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // 2. Atualizar o perfil com o nome de usuário
      await updateProfile(userCredential.user, {
        displayName: userData.username
      });

      // 3. Criar documento do usuário no Firestore
      const userDoc = {
        username: userData.username,
        email: userData.email,
        accessLevel: userData.accessLevel,
        status: userData.status,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

      return {
        id: userCredential.user.uid,
        ...userDoc
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw this.handleError(error);
    }
  }

  static async updateUser(userId: string, userData: Partial<UserData> & { password?: string; currentPassword?: string }) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Se estiver alterando o email
      if (userData.email && userData.email !== userDoc.data().email) {
        await verifyBeforeUpdateEmail(currentUser, userData.email);
      }

      // Se estiver alterando a senha
      if (userData.password) {
        if (!userData.currentPassword) {
          throw new Error('Senha atual é necessária para alterar a senha');
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          userData.currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, userData.password);
      }

      // Atualizar dados no Firestore
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };

      delete updateData.password;
      delete updateData.currentPassword;

      await updateDoc(userRef, updateData);

      return {
        id: userId,
        ...updateData
      };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw this.handleError(error);
    }
  }

  static async deleteUser(userId: string) {
    try {
      // 1. Verificar se o usuário existe
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const userData = userDoc.data();

      // 2. Verificar se não é o admin
      if (userData.accessLevel === 'admin') {
        throw new Error('Não é possível excluir o usuário administrador');
      }

      // 3. Deletar usuário do Firebase Auth
      try {
        const firebaseAuth = getAuth();
        const user = await firebaseAuth.getUser(userId);
        if (user) {
          await deleteFirebaseUser(user);
        }
      } catch (authError) {
        console.warn('Usuário não encontrado no Auth:', authError);
      }

      // 4. Deletar documento do Firestore
      await deleteDoc(userRef);

      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw this.handleError(error);
    }
  }

  private static async getUserByEmail(email: string) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : snapshot.docs[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    // Erros específicos do Firebase Auth
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return new Error('Este email já está em uso');
        case 'auth/invalid-email':
          return new Error('Email inválido');
        case 'auth/weak-password':
          return new Error('A senha deve ter pelo menos 6 caracteres');
        case 'auth/requires-recent-login':
          return new Error('Por favor, faça login novamente para alterar a senha');
        case 'auth/wrong-password':
          return new Error('Senha atual incorreta');
        case 'auth/user-not-found':
          return new Error('Usuário não encontrado');
        case 'auth/operation-not-allowed':
          return new Error('Operação não permitida');
        default:
          return new Error(error.message || 'Erro na operação');
      }
    }

    // Se for um erro personalizado nosso, retornar como está
    if (error instanceof Error) {
      return error;
    }

    // Erro genérico
    return new Error('Ocorreu um erro inesperado');
  }
}