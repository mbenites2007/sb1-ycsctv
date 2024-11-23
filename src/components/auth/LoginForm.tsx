import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de autenticação aqui
    navigate('/dashboard');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <User className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Sistema de Gestão de Orçamentos
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Nome de Usuário
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <User className="w-5 h-5" />
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Senha
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Lock className="w-5 h-5" />
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
            Esqueceu a senha?
          </a>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;