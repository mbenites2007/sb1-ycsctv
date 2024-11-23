import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoadingScreen from './components/common/LoadingScreen';
import Layout from './components/layout/Layout';
import { useAuth } from './contexts/AuthContext';

// Lazy load das páginas
const Login = React.lazy(() => import('./pages/Login'));
const RecuperarSenha = React.lazy(() => import('./pages/RecuperarSenha'));
const RedefinirSenha = React.lazy(() => import('./pages/RedefinirSenha'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Usuarios = React.lazy(() => import('./pages/Usuarios'));
const Clientes = React.lazy(() => import('./pages/Clientes'));
const Servicos = React.lazy(() => import('./pages/Servicos'));
const Fatores = React.lazy(() => import('./pages/Fatores'));
const Orcamentos = React.lazy(() => import('./pages/Orcamentos'));

// Componente para proteger rotas administrativas
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.accessLevel !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          
          {/* Rotas protegidas */}
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Rota administrativa */}
            <Route path="/usuarios" element={
              <AdminRoute>
                <Usuarios />
              </AdminRoute>
            } />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/fatores" element={<Fatores />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
          </Route>

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;