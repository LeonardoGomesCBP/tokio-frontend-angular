export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  roles?: Role[];
  addresses?: Address[];
  createdAt?: string;
}

export interface Role {
  id?: number;
  name: string;
}

export interface Address {
  id?: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  userId?: number;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export enum RoleType {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN'
} 