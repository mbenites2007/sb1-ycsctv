import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;