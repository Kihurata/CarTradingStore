import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { UserStatus } from '../models/user'; 
import { authenticateToken } from '../middleware/auth';  // Import middleware

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password_hash, name, phone, is_admin } = req.body;
    const user = await userService.createUser({ email, password_hash, name, phone, is_admin, status: UserStatus.ACTIVE }); 
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
};

export const lockUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, UserStatus.LOCKED); 
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to lock user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Thêm getMe
export const getMe = [
  authenticateToken,
  async (req: Request & { user?: { id: string; is_admin: boolean } }, res: Response) => {
    try {
      const user = await userService.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password_hash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
];