import request from 'supertest';
import express from 'express';
import * as adminController from '../../../src/controllers/adminController';

jest.mock('../../../src/middleware/auth', () => ({
  requireAdmin: (req: any, res: any, next: any) => next(), // Luôn cho qua
}));

jest.mock('../../../src/controllers/adminController');

import adminRoutes from '../../../src/routes/adminRoutes';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Unit Test: Admin Routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('GET /listings should call adminController.getListings', async () => {
    (adminController.getListings as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/admin/listings');
    expect(adminController.getListings).toHaveBeenCalled();
  });

  it('GET /stats should call adminController.getAdminStats', async () => {
    (adminController.getAdminStats as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/admin/stats');
    expect(adminController.getAdminStats).toHaveBeenCalled();
  });

  it('PATCH /users/:id/status should call adminController.updateUserStatusHandler', async () => {
    (adminController.updateUserStatusHandler as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).patch('/api/admin/users/123/status');
    expect(adminController.updateUserStatusHandler).toHaveBeenCalled();
  });
});