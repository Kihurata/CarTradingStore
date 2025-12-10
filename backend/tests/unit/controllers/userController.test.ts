import { Request, Response } from 'express';
import * as userController from '../../../src/controllers/userController';
import * as userService from '../../../src/services/userService';
import { UserStatus } from '../../../src/models/user';

jest.mock('../../../src/services/userService');
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => next(),
}));

describe('UserController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let send: jest.Mock;

beforeEach(() => {
    json = jest.fn();
    send = jest.fn();
    status = jest.fn().mockReturnValue({ json, send }); 
    req = { params: {}, body: {}, user: { id: 'user-id' } } as any;
    res = { json, status, send } as any;
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      (userService.getAllUsers as jest.Mock).mockResolvedValue([]);
      await userController.getAllUsers(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith([]);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      req.body = { email: 'a@b.com', password_hash: '123' };
      (userService.createUser as jest.Mock).mockResolvedValue({ id: '1' });

      await userController.createUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getMe', () => {
    // getMe is an array [middleware, handler]
    const getMeHandler = (userController.getMe as any)[1];

    it('should return user info without password', async () => {
      const mockUser = { id: 'user-id', email: 'a@b.com', password_hash: 'secret' };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await getMeHandler(req as Request, res as Response);

      expect(json).toHaveBeenCalledWith({ id: 'user-id', email: 'a@b.com' });
      // Ensure password_hash is stripped
      expect(json.mock.calls[0][0]).not.toHaveProperty('password_hash');
    });

    it('should return 404 if user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      await getMeHandler(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUser', () => {
    it('should return user detail', async () => {
      req.params = { id: 'u-1' };
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: 'u-1' });

      await userController.getUser(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ id: 'u-1' });
    });

    it('should return 404 if user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      await userController.getUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(new Error());
      await userController.getUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  // Test lockUser [cite: 11]
  describe('lockUser', () => {
    it('should lock user successfully', async () => {
      req.params = { id: 'u-1' };
      (userService.updateUserStatus as jest.Mock).mockResolvedValue({ id: 'u-1', status: 'locked' });

      await userController.lockUser(req as Request, res as Response);
      
      expect(userService.updateUserStatus).toHaveBeenCalledWith('u-1', UserStatus.LOCKED);
      expect(json).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      (userService.updateUserStatus as jest.Mock).mockResolvedValue(null);
      await userController.lockUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  // Test deleteUser [cite: 14]
  describe('deleteUser', () => {
    it('should delete user and return 204', async () => {
      req.params = { id: 'u-1' };
      (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await userController.deleteUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(204);
      expect(send).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue(new Error());
      await userController.deleteUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });
});