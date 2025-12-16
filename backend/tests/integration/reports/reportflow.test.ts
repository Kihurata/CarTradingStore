import request from 'supertest';
import pool from '../../../src/config/database';

// =================================================================
// 1. MOCK DATABASE & SERVICES
// =================================================================
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
  connect: jest.fn(),
  on: jest.fn(),
}));

jest.mock('../../../src/services/listingService', () => ({
  getListingById: jest.fn(),
}));

jest.mock('../../../src/services/reportService', () => ({
  createReport: jest.fn(),
  updateReportStatus: jest.fn(),
}));

jest.mock('../../../src/services/adminService', () => ({
  getListingReports: jest.fn(),
}));

// Mock Auth Dynamic
let mockUserRole = 'user'; 
let mockUserId = 'user-123';

jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { 
      id: mockUserId, 
      role: mockUserRole,
      is_admin: mockUserRole === 'admin' 
    };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    if (mockUserRole !== 'admin') {
      return res.status(403).json({ error: 'Admin required' });
    }
    next();
  },
  authenticateTokenOptional: (req: any, res: any, next: any) => {
    req.user = { id: mockUserId, role: mockUserRole };
    next();
  }
}));

import app from '../../../src/app';
import * as listingService from '../../../src/services/listingService';
import * as reportService from '../../../src/services/reportService';
import * as adminService from '../../../src/services/adminService';

const mockGetListingById = listingService.getListingById as jest.Mock;
const mockCreateReport = reportService.createReport as jest.Mock;
const mockUpdateReportStatus = reportService.updateReportStatus as jest.Mock;
const mockGetListingReports = adminService.getListingReports as jest.Mock;

describe('Report System Integration Flow', () => {
  const LISTING_ID = 'listing-789';
  const REPORTER_ID = 'user-123';
  const ADMIN_ID = 'admin-999';
  const REPORT_ID = 'report-555';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRole = 'user';
    mockUserId = REPORTER_ID;
  });

  afterAll(async () => {
    if (pool.end) await pool.end();
  });

  // --- Step 1: User views listing ---
  it('Step 1: User views a listing details', async () => {
    mockGetListingById.mockResolvedValue({
      id: LISTING_ID,
      title: 'Xe có vấn đề',
      seller_id: 'seller-001'
    });

    const res = await request(app).get(`/api/listings/${LISTING_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(LISTING_ID);
  });

  // --- Step 2: User report 
  it('Step 2: User submits a report for the listing', async () => {
    const reportData = {
      listing_id: LISTING_ID,
      type: 'SPAM',
      note: 'Bài đăng spam quảng cáo'
    };

    mockCreateReport.mockResolvedValue({
      id: REPORT_ID,
      ...reportData,
      reporter_id: REPORTER_ID,
      status: 'new', 
      created_at: new Date()
    });

    const res = await request(app)
      .post('/api/reports')
      .send(reportData);

    expect(res.status).toBe(201); 
    

    const responseData = res.body.data || res.body;
    expect(responseData.id).toBe(REPORT_ID);
  });

  // --- Step 3: Admin views reports ---
  it('Step 3: Admin views reports for specific listing', async () => {
    mockUserRole = 'admin';
    mockUserId = ADMIN_ID;

    mockGetListingReports.mockResolvedValue([
      {
        id: REPORT_ID,
        listing_id: LISTING_ID,
        type: 'SPAM',
        status: 'new'
      }
    ]);

    const res = await request(app)
      .get(`/api/admin/listings/${LISTING_ID}/reports`)
      .set('Cookie', ['jwt=mock_admin_token']);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  // --- Step 4: Admin resolves
  it('Step 4: Admin resolves the report', async () => {
    mockUserRole = 'admin';
    mockUserId = ADMIN_ID;
    
    const newStatus = 'resolved'; 

    mockUpdateReportStatus.mockResolvedValue({
      id: REPORT_ID,
      status: newStatus,
      reviewed_by: ADMIN_ID
    });

    const res = await request(app)
      .patch(`/api/reports/${REPORT_ID}/status`)
      .send({ status: newStatus });

    // Debug nếu lỗi xảy ra
    if (res.status !== 200) {
        console.log('DEBUG Step 4 Error Response:', res.body);
    }

    expect(res.status).toBe(200);
    const responseData = res.body.data || res.body;
    expect(responseData.status).toBe(newStatus);
    
    expect(mockUpdateReportStatus).toHaveBeenCalledWith(
        REPORT_ID,
        newStatus, 
        ADMIN_ID
    );
  });

  it('Security Check: Normal user cannot resolve reports', async () => {
    mockUserRole = 'user';
    mockUserId = REPORTER_ID;

    const res = await request(app)
      .patch(`/api/reports/${REPORT_ID}/status`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
  });
});