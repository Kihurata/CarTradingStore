// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { sendResetEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const { rows } = await pool.query(
      'INSERT INTO users (id, email, password_hash, name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, email, passwordHash, name, phone]
    );
    const token = jwt.sign({ id: rows[0].id, is_admin: false }, process.env.JWT_SECRET!);
    res.status(201).json({ token, user: rows[0] });
  } catch (err) {
    if ((err as any).code === '23505') res.status(400).json({ error: 'Email already exists' });
    else res.status(500).json({ error: (err as Error).message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { rows } = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const token = uuidv4();
    await pool.query(
      `UPDATE users 
       SET metadata = jsonb_set(COALESCE(metadata, '{}'), ARRAY['reset_token'], to_jsonb($1), true) 
       WHERE email = $2`,
      [token, email]
    );
    await sendResetEmail(email, token);
    res.json({ message: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { rows } = await pool.query(
      `UPDATE users 
       SET password_hash = $1, metadata = metadata - 'reset_token' 
       WHERE metadata->>'reset_token' = $2 
       RETURNING id`,
      [passwordHash, token]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid token' });
    res.json({ message: 'Password reset success' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};