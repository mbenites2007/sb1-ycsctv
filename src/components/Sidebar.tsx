import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UserCircle, Building2, FileText, LayoutDashboard, Percent } from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/usuarios', icon: Users, label: 'Usuários' },
  { path: '/clientes', icon: UserCircle, label: 'Clientes' },
  { path: '/servicos', icon: Building2, label: 'Serviços' },
  { path: '/fatores', icon: Percent, label: 'Fatores' },
  { path: '/orcamentos', icon: FileText, label: 'Orçamentos' }
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Prospectus</h1>
        <p className="text-sm text-indigo-200 mt-1">Sistema de Gestão</p>
      </div>
      <nav className="mt-2">
        {menuItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-800 text-white border-l-4 border-white'
                  : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;