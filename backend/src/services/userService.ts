import pool from '../config/database';
import { User, UserStatus, createUser as prepareUser } from '../models/user';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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

// --- HÀM MỚI 1: Tạo token và lưu vào DB ---
export const createPasswordResetToken = async (email: string): Promise<string | null> => {
  try {
    // 1. Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString('hex');
    
    // 2. Lưu vào DB (hết hạn sau 1 giờ)
    const query = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = NOW() + interval '1 hour'
      WHERE email = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [token, email]);
    
    // Nếu không tìm thấy email, trả về null
    if (result.rows.length === 0) return null;
    
    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw new Error('Failed to create password reset token');
  }
};

// --- HÀM MỚI 2: Xác thực token và đổi mật khẩu ---
export const resetUserPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    // 1. Kiểm tra token có hợp lệ và còn hạn không
    const checkQuery = `
      SELECT id FROM users 
      WHERE reset_password_token = $1 AND reset_password_expires > NOW()
    `;
    const userCheck = await pool.query(checkQuery, [token]);
    
    if (userCheck.rows.length === 0) return false; // Token sai hoặc hết hạn

    // 2. Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật mật khẩu và xóa token
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = $2
    `;
    
    await pool.query(updateQuery, [passwordHash, userCheck.rows[0].id]);
    return true;
  } catch (error) {
    console.error('Error resetting user password:', error);
    throw new Error('Failed to reset user password');
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