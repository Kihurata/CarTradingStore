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
    /*
    [Description]: Kiểm tra xem API có trả về danh sách tất cả người dùng hay không.
    [Pre-condition]: Service getAllUsers hoạt động bình thường.
    [Data Test]: Request mặc định (không có tham số đặc biệt).
    [Steps]: 
      1. Mock userService.getAllUsers trả về mảng rỗng [].
      2. Gọi hàm userController.getAllUsers(req, res).
    [Expected Result]: Response JSON được gọi với mảng [].
    */
    it('should return all users', async () => {
      (userService.getAllUsers as jest.Mock).mockResolvedValue([]);
      await userController.getAllUsers(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith([]);
    });
  });

  describe('createUser', () => {
    /*
    [Description]: Kiểm tra quy trình tạo người dùng mới thành công và trả về mã 201.
    [Pre-condition]: Dữ liệu đầu vào hợp lệ, Service createUser thành công.
    [Data Test]: req.body = { email: 'a@b.com', password_hash: '123' }
    [Steps]: 
      1. Mock userService.createUser trả về object { id: '1' }.
      2. Gọi hàm userController.createUser(req, res).
    [Expected Result]: 
      - Response trả về status code 201.
      - JSON response chứa { id: '1' }.
    */
    it('should create user', async () => {
      req.body = { email: 'a@b.com', password_hash: '123' };
      (userService.createUser as jest.Mock).mockResolvedValue({ id: '1' });

      await userController.createUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getMe', () => {
    const getMeHandler = (userController.getMe as any)[1];

    /*
    [Description]: Kiểm tra xem API có trả về thông tin cá nhân của người dùng hiện tại và loại bỏ trường mật khẩu hay không.
    [Pre-condition]: User ID trong token tồn tại trong DB.
    [Data Test]: req.user = { id: 'user-id' }
    [Steps]: 
      1. Mock userService.getUserById trả về user có chứa password_hash.
      2. Gọi handler getMeHandler(req, res).
    [Expected Result]: 
      - JSON trả về thông tin user.
      - Trường password_hash KHÔNG tồn tại trong response.
    */
    it('should return user info without password', async () => {
      const mockUser = { id: 'user-id', email: 'a@b.com', password_hash: 'secret' };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await getMeHandler(req as Request, res as Response);

      expect(json).toHaveBeenCalledWith({ id: 'user-id', email: 'a@b.com' });
      // Đảm bảo trường mật khẩu đã được loại bỏ khỏi kết quả trả về
      expect(json.mock.calls[0][0]).not.toHaveProperty('password_hash');
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 404 khi không tìm thấy thông tin người dùng trong cơ sở dữ liệu hay không.
    [Pre-condition]: User ID trong token không tồn tại trong DB.
    [Data Test]: req.user = { id: 'user-id' }
    [Steps]: 
      1. Mock userService.getUserById trả về null.
      2. Gọi handler getMeHandler(req, res).
    [Expected Result]: Response trả về status code 404.
    */
    it('should return 404 if user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      await getMeHandler(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUser', () => {
    /*
    [Description]: Kiểm tra xem API có trả về chi tiết thông tin người dùng dựa trên ID (params) hay không.
    [Pre-condition]: User ID tồn tại.
    [Data Test]: req.params = { id: 'u-1' }
    [Steps]: 
      1. Mock userService.getUserById trả về object { id: 'u-1' }.
      2. Gọi hàm userController.getUser(req, res).
    [Expected Result]: Response JSON trả về data user.
    */
    it('should return user detail', async () => {
      req.params = { id: 'u-1' };
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: 'u-1' });

      await userController.getUser(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ id: 'u-1' });
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 404 khi không tìm thấy người dùng với ID cung cấp hay không.
    [Pre-condition]: User ID không tồn tại.
    [Data Test]: req.params = { id: 'any' }
    [Steps]: 
      1. Mock userService.getUserById trả về null.
      2. Gọi hàm userController.getUser(req, res).
    [Expected Result]: Response trả về status code 404.
    */
    it('should return 404 if user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      await userController.getUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 500 khi server gặp sự cố (Exception) trong quá trình lấy thông tin hay không.
    [Pre-condition]: Service gặp lỗi database hoặc lỗi hệ thống.
    [Data Test]: req.params = { id: 'any' }
    [Steps]: 
      1. Mock userService.getUserById ném ra Error.
      2. Gọi hàm userController.getUser(req, res).
    [Expected Result]: Response trả về status code 500.
    */
    it('should return 500 on error', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(new Error());
      await userController.getUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('lockUser', () => {
    /*
    [Description]: Kiểm tra tính năng khóa người dùng: cập nhật trạng thái sang 'LOCKED' thành công.
    [Pre-condition]: User tồn tại và service update thành công.
    [Data Test]: req.params = { id: 'u-1' }
    [Steps]: 
      1. Mock userService.updateUserStatus trả về user đã update status 'locked'.
      2. Gọi hàm userController.lockUser(req, res).
    [Expected Result]: 
      - Service updateUserStatus được gọi với status LOCKED.
      - Response thành công.
    */
    it('should lock user successfully', async () => {
      req.params = { id: 'u-1' };
      (userService.updateUserStatus as jest.Mock).mockResolvedValue({ id: 'u-1', status: 'locked' });

      await userController.lockUser(req as Request, res as Response);
      
      expect(userService.updateUserStatus).toHaveBeenCalledWith('u-1', UserStatus.LOCKED);
      expect(json).toHaveBeenCalled();
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 404 khi cố gắng khóa một người dùng không tồn tại hay không.
    [Pre-condition]: User ID không tìm thấy để update.
    [Data Test]: req.params = { id: 'u-1' }
    [Steps]: 
      1. Mock userService.updateUserStatus trả về null.
      2. Gọi hàm userController.lockUser(req, res).
    [Expected Result]: Response trả về status code 404.
    */
    it('should return 404 if user not found', async () => {
      (userService.updateUserStatus as jest.Mock).mockResolvedValue(null);
      await userController.lockUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    /*
    [Description]: Kiểm tra tính năng xóa người dùng thành công và trả về mã 204 (No Content).
    [Pre-condition]: Xóa thành công, không có lỗi.
    [Data Test]: req.params = { id: 'u-1' }
    [Steps]: 
      1. Mock userService.deleteUser resolve thành công (undefined).
      2. Gọi hàm userController.deleteUser(req, res).
    [Expected Result]: 
      - Response trả về status code 204.
      - Hàm send() được gọi để kết thúc request.
    */
    it('should delete user and return 204', async () => {
      req.params = { id: 'u-1' };
      (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await userController.deleteUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(204);
      expect(send).toHaveBeenCalled();
    });

    /*
    [Description]: Kiểm tra xem API có xử lý lỗi server (500) khi quá trình xóa thất bại hay không.
    [Pre-condition]: Service xóa gặp lỗi.
    [Data Test]: req.params = { id: 'u-1' }
    [Steps]: 
      1. Mock userService.deleteUser ném ra Error.
      2. Gọi hàm userController.deleteUser(req, res).
    [Expected Result]: Response trả về status code 500.
    */
    it('should return 500 on error', async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue(new Error());
      await userController.deleteUser(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  // describe('createUser - Boundary Testing (Password Length)', () => {
  //   /*
  //   [Description]: Kiểm tra xem API có trả về lỗi 400 (Bad Request) khi mật khẩu nằm ngay dưới giá trị biên tối thiểu (5 ký tự) hay không.
  //   [Pre-condition]: Dữ liệu đầu vào các trường khác hợp lệ. Quy định mật khẩu tối thiểu 6 ký tự.
  //   [Data Test]: req.body = { email: 'test_boundary@example.com', password_hash: '12345' } (Chuỗi 5 ký tự).
  //   [Steps]: 
  //     1. Mock userService.createUser giả lập thành công (để chứng minh nếu Controller không chặn thì Service sẽ được gọi và trả về 201).
  //     2. Gọi hàm userController.createUser(req, res).
  //   [Expected Result]: Response trả về status code 400.
  //   */
  //   it('should return 400 when password length is at lower boundary (5 chars)', async () => {
  //     req.body = { 
  //         email: 'test_boundary@example.com', 
  //         password_hash: '12345' 
  //     };

  //     (userService.createUser as jest.Mock).mockResolvedValue({ id: 'new-id' });
  //     await userController.createUser(req as Request, res as Response);
  //     expect(status).toHaveBeenCalledWith(400); 
  //   });
  // });
});