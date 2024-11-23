import React from 'react';
import { Client } from '../../types';
import { Pencil, Trash2, MapPin, Phone, Mail, Building2, Users } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {clients.map((client) => (
        <div
          key={client.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{client.document}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(client)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Editar"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(client.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Excluir"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600">
              <Mail className="h-5 w-5 mr-2" />
              <span className="text-sm">{client.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-5 w-5 mr-2" />
              <span className="text-sm">{client.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-sm truncate">
                {client.street}, {client.number}
                {client.complement && ` - ${client.complement}`}
              </span>
            </div>
          </div>

          {(client.mayor || client.party || client.mayorPhone) && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {client.mayor && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span className="text-sm">Prefeito: {client.mayor}</span>
                  </div>
                )}
                {client.party && (
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="text-sm">Partido: {client.party}</span>
                  </div>
                )}
                {client.mayorPhone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="text-sm">Tel. Prefeito: {client.mayorPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {client.observations && (
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Observações:</p>
              <p className="mt-1">{client.observations}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientList;