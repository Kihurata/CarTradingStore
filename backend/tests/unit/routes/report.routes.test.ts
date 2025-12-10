import request from 'supertest';
import express from 'express';
import * as reportController from '../../../src/controllers/reportController';

// 1. Mock Middleware
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => next(),
  requireAdmin: (req: any, res: any, next: any) => next(),
  // Mock optional auth cũng cho qua luôn
  authenticateTokenOptional: (req: any, res: any, next: any) => next(),
}));

// 2. Mock Controller
jest.mock('../../../src/controllers/reportController');

import reportRoutes from '../../../src/routes/reportRoutes';

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Unit Test: Report Routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('POST / should call reportController.createReport', async () => {
    (reportController.createReport as jest.Mock).mockImplementation((req, res) => res.sendStatus(201));
    
    await request(app).post('/api/reports').send({ reason: 'Spam' });
    
    expect(reportController.createReport).toHaveBeenCalled();
  });

  it('GET / should call reportController.getReportsForListing', async () => {
    (reportController.getReportsForListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    // Test query params nếu cần
    await request(app).get('/api/reports?listing_id=1');
    
    expect(reportController.getReportsForListing).toHaveBeenCalled();
  });

  it('PATCH /:reportId/status should call reportController.updateReportStatusController', async () => {
    (reportController.updateReportStatusController as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).patch('/api/reports/100/status').send({ status: 'resolved' });
    
    expect(reportController.updateReportStatusController).toHaveBeenCalled();
  });
});