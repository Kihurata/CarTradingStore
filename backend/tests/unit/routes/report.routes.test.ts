import request from 'supertest';
import express from 'express';
import * as reportController from '../../../src/controllers/reportController';

// 1. Giả lập Middleware
jest.mock('../../../src/middleware/auth', () => ({
  // Bỏ qua xác thực token
  authenticateToken: (req: any, res: any, next: any) => next(),
  // Bỏ qua yêu cầu quyền Admin
  requireAdmin: (req: any, res: any, next: any) => next(),
  // Bỏ qua xác thực tùy chọn
  authenticateTokenOptional: (req: any, res: any, next: any) => next(),
}));

// 2. Giả lập Controller
jest.mock('../../../src/controllers/reportController');

import reportRoutes from '../../../src/routes/reportRoutes';

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Unit Test: Report Routes', () => {
  afterEach(() => jest.clearAllMocks());

  /*
  [Description]: Kiểm tra route POST / (Tạo báo cáo mới) có gọi đúng controller reportController.createReport hay không.
  [Pre-condition]: Middleware Auth được mock để cho phép request đi qua.
  [Data Test]: Method: POST, Path: '/api/reports', Body: { reason: 'Spam' }
  [Steps]: 
    1. Mock reportController.createReport trả về status 201.
    2. Gửi request POST đến '/api/reports' kèm body.
  [Expected Result]: Controller reportController.createReport được gọi chính xác.
  */
  it('POST / should call reportController.createReport', async () => {
    (reportController.createReport as jest.Mock).mockImplementation((req, res) => res.sendStatus(201));
    
    await request(app).post('/api/reports').send({ reason: 'Spam' });
    
    expect(reportController.createReport).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route GET / (Lấy danh sách báo cáo) có gọi đúng controller reportController.getReportsForListing hay không.
  [Pre-condition]: Middleware Auth được mock để cho phép request đi qua.
  [Data Test]: Method: GET, Path: '/api/reports?listing_id=1'
  [Steps]: 
    1. Mock reportController.getReportsForListing trả về status 200.
    2. Gửi request GET đến '/api/reports' với tham số listing_id.
  [Expected Result]: Controller reportController.getReportsForListing được gọi chính xác.
  */
  it('GET / should call reportController.getReportsForListing', async () => {
    (reportController.getReportsForListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    // Test với tham số listing_id
    await request(app).get('/api/reports?listing_id=1');
    
    expect(reportController.getReportsForListing).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route PATCH /:reportId/status (Cập nhật trạng thái báo cáo) có gọi đúng controller reportController.updateReportStatusController hay không.
  [Pre-condition]: Middleware Auth/Admin được mock để cho phép request đi qua.
  [Data Test]: Method: PATCH, Path: '/api/reports/100/status', Body: { status: 'resolved' }
  [Steps]: 
    1. Mock reportController.updateReportStatusController trả về status 200.
    2. Gửi request PATCH đến '/api/reports/100/status' kèm body.
  [Expected Result]: Controller reportController.updateReportStatusController được gọi chính xác.
  */
  it('PATCH /:reportId/status should call reportController.updateReportStatusController', async () => {
    (reportController.updateReportStatusController as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).patch('/api/reports/100/status').send({ status: 'resolved' });
    
    expect(reportController.updateReportStatusController).toHaveBeenCalled();
  });
});