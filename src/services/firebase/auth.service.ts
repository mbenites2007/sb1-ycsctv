import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export class FirebaseAuthService {
  static auth = auth;

  static async createUser(email: string, password: string, username: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        accessLevel: 'standard',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar status do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('Usuário não encontrado no sistema');
      }

      const userData = userDoc.data();
      if (userData.status === 'inactive') {
        await signOut(auth);
        throw new Error('Usuário desativado. Entre em contato com o administrador.');
      }

      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  private static handleAuthError(error: AuthError | any): Error {
    if (!error.code) {
      return new Error(error.message || 'Ocorreu um erro inesperado');
    }

    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desativado',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este email já está em uso',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
      'auth/invalid-credential': 'Email ou senha incorretos',
      'auth/invalid-login-credentials': 'Email ou senha incorretos',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/popup-closed-by-user': 'Operação cancelada pelo usuário',
      'auth/operation-not-allowed': 'Operação não permitida',
      'auth/requires-recent-login': 'Por favor, faça login novamente para continuar',
      'auth/expired-action-code': 'Este link expirou. Solicite um novo',
      'auth/invalid-action-code': 'Link inválido. Solicite um novo'
    };

    const message = errorMessages[error.code] || error.message || 'Ocorreu um erro. Tente novamente.';
    return new Error(message);
  }
}