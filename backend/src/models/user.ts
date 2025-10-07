import { v4 as uuidv4 } from 'uuid';

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  INACTIVE = 'inactive'
}

export interface User {
  id: string;  // UUID
  email: string;
  password_hash: string;
  name?: string;
  phone?: string;
  is_admin: boolean;
  status: UserStatus;
  last_active_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export const createUser = (partial: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => ({
  id: uuidv4(),
  ...partial,
  created_at: new Date(),
  updated_at: new Date(),
});