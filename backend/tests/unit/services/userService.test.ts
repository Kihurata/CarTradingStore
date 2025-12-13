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
    /*
    [Description]: Kiểm tra xem service có trả về tất cả người dùng từ DB hay không.
    [Pre-condition]: Database kết nối bình thường.
    [Data Test]: Không có tham số đầu vào.
    [Steps]: 
      1. Mock pool.query trả về mảng user [{ id: '1' }].
      2. Gọi hàm userService.getAllUsers().
    [Expected Result]: Hàm trả về mảng có độ dài 1.
    */
    it('should return all users', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(1);
    });
  });

  describe('createUser', () => {
    /*
    [Description]: Kiểm tra xem service có thực hiện chèn dữ liệu và trả về người dùng mới được tạo hay không.
    [Pre-condition]: Dữ liệu đầu vào hợp lệ.
    [Data Test]: input = { email: 'a@a.com', password_hash: 'hash' }
    [Steps]: 
      1. Mock pool.query trả về mockUser.
      2. Gọi hàm userService.createUser(input).
    [Expected Result]: 
      - pool.query được gọi với câu lệnh INSERT.
      - Kết quả trả về khớp với mockUser.
    */
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
    /*
    [Description]: Kiểm tra xem service có thực hiện truy vấn DELETE với đúng ID hay không.
    [Pre-condition]: User ID tồn tại (hoặc query chạy thành công).
    [Data Test]: id = '1'
    [Steps]: 
      1. Mock pool.query trả về thành công.
      2. Gọi hàm userService.deleteUser('1').
    [Expected Result]: pool.query được gọi với câu lệnh DELETE và tham số ['1'].
    */
    it('should execute delete query', async () => {
        (pool.query as jest.Mock).mockResolvedValue({});
        await userService.deleteUser('1');
        expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });
  });

  describe('getUserById', () => {
    /*
    [Description]: Kiểm tra xem service có trả về người dùng khi tìm thấy ID hay không.
    [Pre-condition]: User tồn tại trong DB.
    [Data Test]: id = '1'
    [Steps]: 
      1. Mock pool.query trả về mảng có 1 phần tử.
      2. Gọi hàm userService.getUserById('1').
    [Expected Result]: Trả về object user đúng email.
    */
    it('should return user if found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', email: 'test@test.com' }] });
      const user = await userService.getUserById('1');
      expect(user).toEqual({ id: '1', email: 'test@test.com' });
    });

    /*
    [Description]: Kiểm tra xem service có trả về null nếu không tìm thấy người dùng với ID cung cấp hay không.
    [Pre-condition]: User không tồn tại.
    [Data Test]: id = '999'
    [Steps]: 
      1. Mock pool.query trả về mảng rỗng [].
      2. Gọi hàm userService.getUserById('999').
    [Expected Result]: Kết quả trả về là null.
    */
    it('should return null if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Trả về mảng rỗng
      const user = await userService.getUserById('999');
      expect(user).toBeNull();
    });

    /*
    [Description]: Kiểm tra xem service có ném lỗi tùy chỉnh khi truy vấn DB thất bại hay không.
    [Pre-condition]: Database mất kết nối hoặc lỗi query.
    [Data Test]: id = '1'
    [Steps]: 
      1. Mock pool.query ném ra Error.
      2. Gọi hàm userService.getUserById('1').
    [Expected Result]: Ném ra lỗi 'Database query failed'.
    */
    it('should throw error if DB fails', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Connection error'));
      await expect(userService.getUserById('1')).rejects.toThrow('Database query failed');
    });
  });

  describe('updateUserStatus', () => {
    /*
    [Description]: Kiểm tra xem service có cập nhật trạng thái người dùng thành công và trả về dữ liệu đã cập nhật hay không.
    [Pre-condition]: User tồn tại.
    [Data Test]: id = '1', status = 'banned'
    [Steps]: 
      1. Mock pool.query thực hiện UPDATE trả về row đã update.
      2. Gọi hàm userService.updateUserStatus('1', 'banned').
    [Expected Result]: 
      - Query UPDATE được gọi đúng tham số.
      - Trả về object chứa status mới.
    */
    it('should update status successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', status: 'banned' }] });
      
      const result = await userService.updateUserStatus('1', 'banned' as any);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET status'),
        ['banned', '1']
      );
      expect(result).toEqual({ id: '1', status: 'banned' });
    });

    /*
    [Description]: Kiểm tra xem service có trả về null nếu không tìm thấy người dùng trong quá trình cập nhật hay không.
    [Pre-condition]: User không tồn tại.
    [Data Test]: id = '999', status = 'banned'
    [Steps]: 
      1. Mock pool.query trả về mảng rỗng.
      2. Gọi hàm userService.updateUserStatus.
    [Expected Result]: Trả về null.
    */
    it('should return null if user not found during update', async () => {
       (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
       const result = await userService.updateUserStatus('999', 'banned' as any);
       expect(result).toBeNull();
    });

    /*
    [Description]: Kiểm tra xem service có ném lỗi tùy chỉnh khi cập nhật thất bại hay không.
    [Pre-condition]: DB lỗi query.
    [Data Test]: id = '1', status = 'active'
    [Steps]: 
      1. Mock pool.query ném ra lỗi 'DB Error'.
      2. Gọi hàm userService.updateUserStatus.
    [Expected Result]: Ném ra lỗi 'Failed to update user status'.
    */
    it('should throw error on update fail', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'));
       await expect(userService.updateUserStatus('1', 'active' as any)).rejects.toThrow('Failed to update user status');
    });
  });

  describe('getAllUsers Error', () => {
    /*
    [Description]: Kiểm tra xem service có ném lỗi tùy chỉnh khi truy vấn getAllUsers thất bại hay không.
    [Pre-condition]: DB lỗi query.
    [Data Test]: Không có.
    [Steps]: 
      1. Mock pool.query ném ra lỗi.
      2. Gọi hàm userService.getAllUsers().
    [Expected Result]: Ném ra lỗi 'Database query failed'.
    */
    it('should throw error on db fail', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('DB Fail'));
       await expect(userService.getAllUsers()).rejects.toThrow('Database query failed');
    });
  });

  describe('createUser Error', () => {
    /*
    [Description]: Kiểm tra xem service có ném lỗi tùy chỉnh khi tạo người dùng thất bại (ví dụ: email trùng lặp) hay không.
    [Pre-condition]: Vi phạm ràng buộc DB (duplicate key).
    [Data Test]: input rỗng hoặc trùng email.
    [Steps]: 
      1. Mock pool.query ném ra lỗi 'Duplicate Email'.
      2. Gọi hàm userService.createUser.
    [Expected Result]: Ném ra lỗi 'Failed to create user'.
    */
    it('should throw error if create fails', async () => {
       (pool.query as jest.Mock).mockRejectedValue(new Error('Duplicate Email'));
       await expect(userService.createUser({} as any)).rejects.toThrow('Failed to create user');
    });
  });

  describe('deleteUser Error', () => {
    /*
    [Description]: Kiểm tra xem service có ném lỗi tùy chỉnh khi xóa người dùng thất bại hay không.
    [Pre-condition]: DB lỗi query.
    [Data Test]: id = '1'
    [Steps]: 
      1. Mock pool.query ném ra lỗi 'Fail'.
      2. Gọi hàm userService.deleteUser('1').
    [Expected Result]: Ném ra lỗi 'Failed to delete user'.
    */
    it('should throw error on failure', async () => {
         (pool.query as jest.Mock).mockRejectedValue(new Error('Fail'));
         await expect(userService.deleteUser('1')).rejects.toThrow('Failed to delete user');
    });
  });
});