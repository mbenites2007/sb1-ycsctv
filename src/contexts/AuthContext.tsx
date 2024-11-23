import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoadingScreen from '../components/common/LoadingScreen';
import { auth, db } from '../config/firebase';
import { FirebaseAuthService } from '../services/firebase/auth.service';

interface User {
  id: string;
  username: string;
  email: string;
  accessLevel: 'admin' | 'standard';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Inicializando AuthProvider...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Estado de autenticação alterado:', firebaseUser?.email);
        
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.status === 'inactive') {
              console.log('Usuário inativo, fazendo logout...');
              await FirebaseAuthService.logout();
              setUser(null);
            } else {
              console.log('Usuário ativo, definindo dados...');
              setUser({
                id: firebaseUser.uid,
                username: userData.username || firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                accessLevel: userData.accessLevel || 'standard'
              });
            }
          } else {
            console.log('Documento do usuário não encontrado, fazendo logout...');
            await FirebaseAuthService.logout();
            setUser(null);
          }
        } else {
          console.log('Nenhum usuário autenticado');
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('Limpando listener de autenticação');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await FirebaseAuthService.login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await FirebaseAuthService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;