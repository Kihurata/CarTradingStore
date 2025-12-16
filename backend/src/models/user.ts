
export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  INACTIVE = 'inactive',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  status: UserStatus;
  last_active_at?: Date;
  created_at: Date;
  updated_at: Date;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
}

export const createUser = (userData: Partial<User>): User => ({
  id: require('uuid').v4(),
  ...userData,
  is_admin: false,
  status: UserStatus.ACTIVE,
  created_at: new Date(),
  updated_at: new Date(),
} as User);