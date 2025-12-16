// tests/unit/routes/user.routes.test.ts
import request from 'supertest';
import express from 'express';

// 1. Mock TRƯỚC KHI import route
jest.mock('../../../src/middleware/auth');
jest.mock('../../../src/controllers/userController');

// 2. Import route SAU khi mock
import userRoutes from '../../../src/routes/userRoutes';

// 3. Import lại để lấy mock instance
import * as auth from '../../../src/middleware/auth';
import * as ctrl from '../../../src/controllers/userController';

// Tạo app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// 4. GÁN MOCK BẰNG TAY – BẮT BUỘC
(auth.authenticateToken as any).mockImplementation((req: any, _res: any, next: any) => {
  req.user = { id: 'test-user-id', role: 'user' };
  next();
});
(auth.requireAdmin as any).mockImplementation((_: any, __: any, next: any) => next());

// 5. Dùng cách DUY NHẤT hoạt động 100%: gán trực tiếp vào module đã mock
const mocked = ctrl as any;

describe('User Routes - Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
  [Description]: Kiểm tra route GET / (lấy tất cả người dùng) có gọi đúng controller getAllUsers hay không.
  [Pre-condition]: Middleware auth được mock (gán user giả, bỏ qua check admin).
  [Data Test]: Method: GET, Path: '/api/users'
  [Steps]: 
    1. Mock controller getAllUsers trả về status 200.
    2. Gửi request GET tới '/api/users'.
  [Expected Result]: Controller mocked.getAllUsers được gọi chính xác.
  */
  it('GET / → getAllUsers', async () => {
    mocked.getAllUsers.mockImplementation((_: any, res: any) => res.sendStatus(200));
    await request(app).get('/api/users');
    expect(mocked.getAllUsers).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route GET /:id (lấy chi tiết người dùng) có gọi đúng controller getUser hay không.
  [Pre-condition]: Middleware auth được mock.
  [Data Test]: Method: GET, Path: '/api/users/123'
  [Steps]: 
    1. Mock controller getUser trả về status 200.
    2. Gửi request GET tới '/api/users/123'.
  [Expected Result]: Controller mocked.getUser được gọi chính xác.
  */
  it('GET /:id → getUser', async () => {
    mocked.getUser.mockImplementation((_: any, res: any) => res.sendStatus(200));
    await request(app).get('/api/users/123');
    expect(mocked.getUser).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route POST / (tạo người dùng) có gọi đúng controller createUser hay không.
  [Pre-condition]: Middleware auth được mock.
  [Data Test]: Method: POST, Path: '/api/users', Body: { email: 'test@test.com' }
  [Steps]: 
    1. Mock controller createUser trả về status 201.
    2. Gửi request POST tới '/api/users' kèm body.
  [Expected Result]: Controller mocked.createUser được gọi chính xác.
  */
  it('POST / → createUser', async () => {
    mocked.createUser.mockImplementation((_: any, res: any) => res.sendStatus(201));
    await request(app).post('/api/users').send({ email: 'test@test.com' });
    expect(mocked.createUser).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route PATCH /:id/lock (khóa người dùng) có gọi đúng controller lockUser hay không.
  [Pre-condition]: Middleware auth được mock.
  [Data Test]: Method: PATCH, Path: '/api/users/123/lock'
  [Steps]: 
    1. Mock controller lockUser trả về status 200.
    2. Gửi request PATCH tới '/api/users/123/lock'.
  [Expected Result]: Controller mocked.lockUser được gọi chính xác.
  */
  it('PATCH /:id/lock → lockUser', async () => {
    mocked.lockUser.mockImplementation((_: any, res: any) => res.sendStatus(200));
    await request(app).patch('/api/users/123/lock');
    expect(mocked.lockUser).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route DELETE /:id (xóa người dùng) có gọi đúng controller deleteUser hay không.
  [Pre-condition]: Middleware auth được mock.
  [Data Test]: Method: DELETE, Path: '/api/users/123'
  [Steps]: 
    1. Mock controller deleteUser trả về status 200.
    2. Gửi request DELETE tới '/api/users/123'.
  [Expected Result]: Controller mocked.deleteUser được gọi chính xác.
  */
  it('DELETE /:id → deleteUser', async () => {
    mocked.deleteUser.mockImplementation((_: any, res: any) => res.sendStatus(200));
    await request(app).delete('/api/users/123');
    expect(mocked.deleteUser).toHaveBeenCalled();
  });
});