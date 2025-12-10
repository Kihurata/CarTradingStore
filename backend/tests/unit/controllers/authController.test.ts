import { Request, Response } from 'express';
import * as authController from '../../../src/controllers/authController';
import pool from '../../../src/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/email');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let cookie: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    cookie = jest.fn();
    req = { body: {} } as any;
    res = { json, status, cookie } as any;
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if missing fields', async () => {
      req.body = {};
      await authController.register(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if email exists', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '0901234567',
        address: 'Test Address'
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, email: 'existing@example.com' }],
        rowCount: 1
      });

      await authController.register(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(409);
    });

    it('should create user and return token on success', async () => {
      req.body = {
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '0901234567',
        address: 'addr'
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'user-id', email: 'new@test.com', role: 'user' }],
        rowCount: 1
      });

      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await authController.register(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mock-token' }));
    });
  });

  describe('login', () => {
    it('should return 401 if user not found', async () => {
      req.body = { email: 'notfound@test.com', password: 'pass' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });

      await authController.login(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(401);
    });

    it('should login successfully', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };

      const mockUser = {
        id: '1',
        password: 'hashed_password',
        email: 'test@test.com',
        role: 'user'
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser], rowCount: 1 });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await authController.login(req as Request, res as Response);

      expect(res.cookie).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mock-token' }));
    });
  });
});