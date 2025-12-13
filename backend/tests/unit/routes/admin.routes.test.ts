import request from 'supertest';
import express from 'express';
import * as adminController from '../../../src/controllers/adminController';

jest.mock('../../../src/middleware/auth', () => ({
  // Giả lập middleware requireAdmin: luôn cho phép request đi qua
  requireAdmin: (req: any, res: any, next: any) => next(), 
}));

jest.mock('../../../src/controllers/adminController');

import adminRoutes from '../../../src/routes/adminRoutes';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Unit Test: Admin Routes', () => {
  afterEach(() => jest.clearAllMocks());

  /*
  [Description]: Kiểm tra route GET /listings có gọi đúng controller getListings hay không.
  [Pre-condition]: Middleware requireAdmin được mock để luôn cho phép (next).
  [Data Test]: Method: GET, Path: '/api/admin/listings'
  [Steps]: 
    1. Mock adminController.getListings trả về status 200.
    2. Gửi request GET đến '/api/admin/listings'.
  [Expected Result]: Controller adminController.getListings được gọi chính xác.
  */
  it('GET /listings should call adminController.getListings', async () => {
    (adminController.getListings as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/admin/listings');
    expect(adminController.getListings).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route GET /stats có gọi đúng controller getAdminStats hay không.
  [Pre-condition]: Middleware requireAdmin được mock để luôn cho phép.
  [Data Test]: Method: GET, Path: '/api/admin/stats'
  [Steps]: 
    1. Mock adminController.getAdminStats trả về status 200.
    2. Gửi request GET đến '/api/admin/stats'.
  [Expected Result]: Controller adminController.getAdminStats được gọi chính xác.
  */
  it('GET /stats should call adminController.getAdminStats', async () => {
    (adminController.getAdminStats as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/admin/stats');
    expect(adminController.getAdminStats).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route PATCH /users/:id/status có gọi đúng controller updateUserStatusHandler hay không.
  [Pre-condition]: Middleware requireAdmin được mock để luôn cho phép.
  [Data Test]: Method: PATCH, Path: '/api/admin/users/123/status'
  [Steps]: 
    1. Mock adminController.updateUserStatusHandler trả về status 200.
    2. Gửi request PATCH đến '/api/admin/users/123/status'.
  [Expected Result]: Controller adminController.updateUserStatusHandler được gọi chính xác.
  */
  it('PATCH /users/:id/status should call adminController.updateUserStatusHandler', async () => {
    (adminController.updateUserStatusHandler as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).patch('/api/admin/users/123/status');
    expect(adminController.updateUserStatusHandler).toHaveBeenCalled();
  });
});