import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema de Gestão de Orçamentos
            </h1>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
                <span className="text-xs text-gray-500">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 flex items-center space-x-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;