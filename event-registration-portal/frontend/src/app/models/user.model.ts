import { Role } from './role.enum';

export interface User {
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  createdAt?: string;
}
