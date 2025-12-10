import * as userService from '../../../src/services/userService';
import pool from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/models/user', () => ({
    ...jest.requireActual('../../../src/models/user'),
    createUser: (data: any) => ({ ...data, id: 'mock-uuid', status: 'active', is_admin: false })
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(1);
    });
  });

  describe('createUser', () => {
    it('should insert and return new user', async () => {
      const input = { email: 'a@a.com', password_hash: 'hash' } as any;
      const mockUser = { id: 'mock-uuid', ...input };
      
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const res = await userService.createUser(input);
      expect(res).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), expect.anything());
    });
  });

  describe('deleteUser', () => {
    it('should execute delete query', async () => {
        (pool.query as jest.Mock).mockResolvedValue({});
        await userService.deleteUser('1');
        expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });
  });

  // 1. Test getUserById 
  describe('getUserById', () => {
    it('should return user if found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', email: 'test@test.com' }] });
      const user = await userService.getUserById('1');
      expect(user).toEqual({ id: '1', email: 'test@test.com' });
    });

    it('should return null if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Trả về mảng rỗng
      const user = await userService.getUserById('999');
      expect(user).toBeNull();
    });

    it('should throw error if DB fails', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Connection error'));
      await expect(userService.getUserById('1')).rejects.toThrow('Database query failed');
    });
  });

  // 2. Test updateUserStatus 
  describe('updateUserStatus', () => {
    it('should update status successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', status: 'banned' }] });
      
      const result = await userService.updateUserStatus('1', 'banned' as any);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET status'),
        ['banned', '1']
      );
      expect(result).toEqual({ id: '1', status: 'banned' });
    });

    it('should return null if user not found during update', async () => {
       (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
       const result = await userService.updateUserStatus('999', 'banned' as any);
       expect(result).toBeNull();
    });

    it('should throw error on update fail', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'));
       await expect(userService.updateUserStatus('1', 'active' as any)).rejects.toThrow('Failed to update user status');
    });
  });

  // 3. Bổ sung Case Lỗi cho các hàm hiện tại 

  describe('getAllUsers Error', () => {
    it('should throw error on db fail', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('DB Fail'));
       await expect(userService.getAllUsers()).rejects.toThrow('Database query failed');
    });
  });

  describe('createUser Error', () => {
    it('should throw error if create fails', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('Duplicate Email'));
       await expect(userService.createUser({} as any)).rejects.toThrow('Failed to create user');
    });
  });

  describe('deleteUser Error', () => {
    it('should throw error on failure', async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error('Fail'));
        await expect(userService.deleteUser('1')).rejects.toThrow('Failed to delete user');
    });
  });
});