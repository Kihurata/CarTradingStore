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
    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi thiếu các trường thông tin bắt buộc hay không.
    [Pre-condition]: Không có dữ liệu trong body request.
    [Data Test]: req.body = {}
    [Steps]: 
      1. Khởi tạo req.body rỗng.
      2. Gọi hàm authController.register(req, res).
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 if missing fields', async () => {
      req.body = {};
      await authController.register(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 409 khi email đăng ký đã tồn tại trong hệ thống hay không.
    [Pre-condition]: Database mock trả về kết quả tìm thấy email trùng.
    [Data Test]: req.body chứa email 'existing@example.com' và các thông tin hợp lệ khác.
    [Steps]: 
      1. Mock pool.query trả về 1 row (đã tồn tại user).
      2. Gọi hàm authController.register(req, res).
    [Expected Result]: Response trả về status code 409 (Conflict).
    */
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

    /*
    [Description]: Kiểm tra quy trình đăng ký thành công: tạo user mới, mã hóa mật khẩu và trả về token.
    [Pre-condition]: Email chưa tồn tại, các service mã hóa và tạo token hoạt động tốt.
    [Data Test]: req.body chứa email 'new@test.com' và thông tin đầy đủ.
    [Steps]: 
      1. Mock pool.query (check email) trả về rỗng.
      2. Mock bcrypt.hash trả về chuỗi đã mã hóa.
      3. Mock pool.query (insert user) trả về user mới tạo.
      4. Mock jwt.sign trả về token giả lập.
      5. Gọi hàm authController.register(req, res).
    [Expected Result]: 
      - Response trả về status code 201.
      - Cookie được thiết lập.
      - JSON response chứa token 'mock-token'.
    */
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
    /*
    [Description]: Kiểm tra xem API có trả về lỗi 401 khi không tìm thấy người dùng (email sai) hay không.
    [Pre-condition]: Database không tìm thấy user với email cung cấp.
    [Data Test]: req.body = { email: 'notfound@test.com', password: 'pass' }
    [Steps]: 
      1. Mock pool.query trả về rỗng (rowCount: 0).
      2. Gọi hàm authController.login(req, res).
    [Expected Result]: Response trả về status code 401 (Unauthorized).
    */
    it('should return 401 if user not found', async () => {
      req.body = { email: 'notfound@test.com', password: 'pass' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });

      await authController.login(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(401);
    });

    /*
    [Description]: Kiểm tra quy trình đăng nhập thành công: so khớp mật khẩu và trả về token xác thực.
    [Pre-condition]: User tồn tại trong DB, mật khẩu khớp.
    [Data Test]: req.body = { email: 'test@test.com', password: 'pass' }
    [Steps]: 
      1. Mock pool.query trả về thông tin user.
      2. Mock bcrypt.compare trả về true (mật khẩu đúng).
      3. Mock jwt.sign trả về token.
      4. Gọi hàm authController.login(req, res).
    [Expected Result]: 
      - Cookie được thiết lập.
      - JSON response chứa token 'mock-token'.
    */
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

  // describe('register - INTENTIONAL FAIL', () => {
  //   /*
  //   [Description]: Kiểm tra quy trình đăng ký khi email thiếu ký tự '@'.
  //   [Pre-condition]: DB hoạt động bình thường.
  //   [Data Test]: req.body = { email: 'no_at_sign.com', password: '123' }
  //   [Steps]: 
  //     1. Mock pool.query ném lỗi (giả lập DB constraint check email).
  //     2. Gọi hàm authController.register(req, res).
  //   [Expected Result]: Response trả về status code 201 (nhưng thực tế là lỗi).
  //   */
  //   it('should register successfully with invalid email format', async () => {
  //     req.body = {
  //       email: 'no_at_sign.com',
  //       password: 'password123',
  //       confirmPassword: 'password123'
  //     };

  //     (pool.query as jest.Mock).mockRejectedValue(new Error('Invalid email format'));

  //     await authController.register(req as Request, res as Response);

  //     // Fail tại đây: Code thực tế sẽ vào catch block (trả 400/500), nhưng ta expect 201
  //     expect(status).toHaveBeenCalledWith(201);
  //   });
  // });
});