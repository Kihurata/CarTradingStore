import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, authenticateTokenOptional, requireAdmin } from '../../../src/middleware/auth';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            cookies: {},
            user: undefined
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('authenticateToken', () => {
        /*
        [Description]: Kiểm tra xem middleware có trả về lỗi 401 khi không tìm thấy token trong cookie hay không.
        [Pre-condition]: Request không chứa cookie 'jwt'.
        [Data Test]: req.cookies = {}
        [Steps]: 
            1. Gọi middleware authenticateToken(req, res, next).
        [Expected Result]: 
            - Response status là 401.
            - Trả về JSON lỗi 'Access denied'.
            - Hàm next() KHÔNG được gọi.
        */
        it('should return 401 if no token is provided', () => {
            authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
            expect(next).not.toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra trường hợp token hợp lệ: middleware phải gọi hàm next() và gán thông tin user vào request.
        [Pre-condition]: Request chứa cookie 'jwt' hợp lệ. Mock jwt.verify trả về thông tin user.
        [Data Test]: req.cookies = { jwt: 'valid_token' }
        [Steps]: 
            1. Mock jwt.verify trả về mockUser.
            2. Gọi middleware authenticateToken(req, res, next).
        [Expected Result]: 
            - jwt.verify được gọi.
            - req.user được gán bằng mockUser.
            - Hàm next() được gọi để đi tiếp.
        */
        it('should call next and set req.user if token is valid', () => {
            req.cookies = { jwt: 'valid_token' };
            const mockUser = { id: '123', is_admin: false };
            (jwt.verify as jest.Mock).mockReturnValue(mockUser);

            authenticateToken(req as Request, res as Response, next);

            expect(jwt.verify).toHaveBeenCalled();
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra xem middleware có trả về lỗi 400 khi token không hợp lệ (hoặc hết hạn, bị thay đổi) hay không.
        [Pre-condition]: Request chứa cookie 'jwt' lỗi.
        [Data Test]: req.cookies = { jwt: 'invalid_token' }
        [Steps]: 
            1. Mock jwt.verify ném ra lỗi (throw Error).
            2. Gọi middleware authenticateToken(req, res, next).
        [Expected Result]: 
            - Response status là 400.
            - Trả về JSON lỗi 'Invalid token'.
            - Hàm next() KHÔNG được gọi.
        */
        it('should return 400 if token is invalid', () => {
            req.cookies = { jwt: 'invalid_token' };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('authenticateTokenOptional', () => {
        /*
        [Description]: Kiểm tra trường hợp không có token: vẫn cho phép đi tiếp (next) nhưng req.user sẽ là undefined.
        [Pre-condition]: Request không chứa cookie 'jwt'.
        [Data Test]: req.cookies = {}
        [Steps]: 
            1. Gọi middleware authenticateTokenOptional(req, res, next).
        [Expected Result]: 
            - req.user là undefined.
            - Hàm next() được gọi.
        */
        it('should call next with req.user undefined if no token provided', () => {
            authenticateTokenOptional(req as Request, res as Response, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra trường hợp có token hợp lệ: xử lý như đăng nhập bình thường (gán req.user và gọi next).
        [Pre-condition]: Request chứa cookie 'jwt' hợp lệ.
        [Data Test]: req.cookies = { jwt: 'valid_token' }
        [Steps]: 
            1. Mock jwt.verify trả về mockUser.
            2. Gọi middleware authenticateTokenOptional(req, res, next).
        [Expected Result]: 
            - req.user được gán giá trị mockUser.
            - Hàm next() được gọi.
        */
        it('should call next and set req.user if token is valid', () => {
            req.cookies = { jwt: 'valid_token' };
            const mockUser = { id: '123', is_admin: false };
            (jwt.verify as jest.Mock).mockReturnValue(mockUser);

            authenticateTokenOptional(req as Request, res as Response, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra trường hợp token bị lỗi: log cảnh báo, không gán req.user nhưng vẫn cho phép đi tiếp (next) thay vì chặn lỗi.
        [Pre-condition]: Request chứa cookie 'jwt' lỗi.
        [Data Test]: req.cookies = { jwt: 'invalid_token' }
        [Steps]: 
            1. Mock jwt.verify ném lỗi.
            2. Gọi middleware authenticateTokenOptional(req, res, next).
        [Expected Result]: 
            - console.warn được gọi để ghi log.
            - req.user là undefined.
            - Hàm next() vẫn được gọi (không chặn request).
        */
        it('should call next with req.user undefined if token is invalid', () => {
            req.cookies = { jwt: 'invalid_token' };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticateTokenOptional(req as Request, res as Response, next);

            expect(console.warn).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('requireAdmin', () => {
        /*
        [Description]: Kiểm tra xem middleware có chặn (lỗi 403) khi người dùng chưa đăng nhập (req.user undefined) hay không.
        [Pre-condition]: Chưa xác thực (chưa chạy qua auth middleware hoặc auth thất bại).
        [Data Test]: req.user = undefined
        [Steps]: 
            1. Gọi middleware requireAdmin(req, res, next).
        [Expected Result]: 
            - Response status là 403.
            - JSON lỗi 'Admin required'.
            - Hàm next() KHÔNG được gọi.
        */
        it('should return 403 if req.user is undefined', () => {
            requireAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin required' });
            expect(next).not.toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra xem middleware có chặn (lỗi 403) khi người dùng đã đăng nhập nhưng không phải là admin hay không.
        [Pre-condition]: Đã xác thực nhưng is_admin = false.
        [Data Test]: req.user = { id: '123', is_admin: false }
        [Steps]: 
            1. Gán req.user là user thường.
            2. Gọi middleware requireAdmin(req, res, next).
        [Expected Result]: 
            - Response status là 403.
            - JSON lỗi 'Admin required'.
            - Hàm next() KHÔNG được gọi.
        */
        it('should return 403 if user is not admin', () => {
            req.user = { id: '123', is_admin: false };

            requireAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin required' });
            expect(next).not.toHaveBeenCalled();
        });

        /*
        [Description]: Kiểm tra trường hợp người dùng là admin: cho phép đi tiếp (gọi next).
        [Pre-condition]: Đã xác thực và is_admin = true.
        [Data Test]: req.user = { id: '123', is_admin: true }
        [Steps]: 
            1. Gán req.user là admin.
            2. Gọi middleware requireAdmin(req, res, next).
        [Expected Result]: 
            - Hàm next() được gọi.
            - Không trả về lỗi (res.status không được gọi).
        */
        it('should call next if user is admin', () => {
            req.user = { id: '123', is_admin: true };

            requireAdmin(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

//     describe('authenticateToken - INTENTIONAL FAIL', () => {
//     /*
//     [Description]: Kiểm tra middleware xử lý thế nào khi token đã hết hạn.
//     [Pre-condition]: Token trong cookie là token cũ.
//     [Data Test]: req.cookies = { jwt: 'expired_token' }
//     [Steps]: 
//       1. Mock jwt.verify ném lỗi 'TokenExpiredError'.
//       2. Gọi hàm authenticateToken(req, res, next).
//     [Expected Result]: Hàm next() được gọi để đi tiếp (nhưng thực tế bị chặn 401).
//     */
//     it('should allow request to proceed even if token is expired', () => {
//       req.cookies = { jwt: 'expired_token' };
//       (jwt.verify as jest.Mock).mockImplementation(() => {
//           throw new Error('TokenExpiredError');
//       });

//       authenticateToken(req as Request, res as Response, next);

//       // Fail tại đây: Middleware thực tế trả res.status(401), nhưng ta expect next()
//       expect(next).toHaveBeenCalled();
//     });
//   });
});