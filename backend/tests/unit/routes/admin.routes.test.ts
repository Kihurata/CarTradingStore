import request from 'supertest';
import express from 'express';
// Import tất cả để dùng cho assertion (expect)
import * as adminController from '../../../src/controllers/adminController';

// 1. Mock Middleware: Phải mock ĐỦ cả authenticateToken
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => next(), // <--- Thêm dòng này
  requireAdmin: (req: any, res: any, next: any) => next(),
}));

// 2. Mock Controller: Nên mock rõ ràng (Factory) để tránh lỗi import undefined
jest.mock('../../../src/controllers/adminController', () => ({
  getListings: jest.fn((req, res) => res.status(200).send()),
  getAdminStats: jest.fn((req, res) => res.status(200).send()),
  updateUserStatusHandler: jest.fn((req, res) => res.status(200).send()),
  getUsers: jest.fn((req, res) => res.status(200).send()), // <--- Quan trọng
  updateListingStatusHandler: jest.fn(),
  updateListingHandler: jest.fn(),
  getReports: jest.fn(),
  printStats: jest.fn(),
}));

// 3. Import Routes (Luôn import sau khi mock)
import adminRoutes from '../../../src/routes/adminRoutes';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Unit Test: Admin Routes', () => {
  // Clear mock để tránh test này ảnh hưởng test kia
  afterEach(() => jest.clearAllMocks());

  it('GET /listings should call adminController.getListings', async () => {
    // Không cần mockImplementation lại nếu ở trên đã có default, 
    // nhưng giữ lại cũng không sao để rõ ràng logic test
    await request(app).get('/api/admin/listings');
    expect(adminController.getListings).toHaveBeenCalled();
  });

  it('GET /stats should call adminController.getAdminStats', async () => {
    await request(app).get('/api/admin/stats');
    expect(adminController.getAdminStats).toHaveBeenCalled();
  });

  it('PATCH /users/:id/status should call adminController.updateUserStatusHandler', async () => {
    await request(app).patch('/api/admin/users/123/status');
    expect(adminController.updateUserStatusHandler).toHaveBeenCalled();
  });
  
  // Test thêm cho route bị lỗi lúc nãy để đảm bảo nó chạy
  it('GET /users should call adminController.getUsers', async () => {
    await request(app).get('/api/admin/users');
    expect(adminController.getUsers).toHaveBeenCalled();
  });
});