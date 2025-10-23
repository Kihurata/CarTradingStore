import pool from '../config/database';
import { User, UserStatus, createUser as prepareUser } from '../models/user'; 

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Database query failed');
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Database query failed');
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  try {
    const newUser = prepareUser(userData); 
    const result = await pool.query(
      'INSERT INTO users (id, email, password_hash, name, phone, address, is_admin, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [newUser.id, newUser.email, newUser.password_hash, newUser.name || null, newUser.phone || null, newUser.address || null, newUser.is_admin, newUser.status]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};

export const updateUserStatus = async (id: string, status: UserStatus): Promise<User | null> => {
  try {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};