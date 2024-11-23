export interface ServiceGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  services: Service[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Service {
  id: string;
  groupId: string;
  code: string;
  title: string;
  description: string;
  unitPrice: number;
  subServices: SubService[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubService {
  id: string;
  code: string;
  description: string;
  unit: string;
  unitPrice: number;
  serviceId: string;
  allowedFactors?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  accessLevel: 'admin' | 'standard';
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  mayor?: string;
  party?: string;
  mayorPhone?: string;
  clientFactors: ClientFactor[];
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientFactor {
  factorId: number;
  subItemId: number;
}

export interface Factor {
  id: string;
  code: number;
  description: string;
  subItems: FactorSubItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FactorSubItem {
  id: string;
  code: number;
  description: string;
  value: number;
  factorId: string;
}

export interface Order {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientDocument: string;
  clientCity: string;
  clientState: string;
  date: string; // Formato YYYY-MM-DD
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'canceled';
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  subServiceId?: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  observations?: string;
}