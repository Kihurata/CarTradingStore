import { Request, Response } from 'express';
import * as adminController from '../../../src/controllers/adminController';
import * as adminService from '../../../src/services/adminService';
import * as statsService from '../../../src/services/statsService';
import * as pdfGenerator from '../../../src/utils/pdfGenerator';
import pool from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/services/adminService');
jest.mock('../../../src/services/statsService');
jest.mock('../../../src/utils/pdfGenerator');
jest.mock('../../../src/config/database', () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

describe('AdminController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let send: jest.Mock;
  let setHeader: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    json = jest.fn();
    send = jest.fn();
    setHeader = jest.fn();
    status = jest.fn().mockReturnValue({ json, send });
    req = { params: {}, query: {}, body: {}, user: { id: 'admin-id' } } as any;
    res = { json, status, send, setHeader } as any;
  });

  // 1. Test getListings [cite: 36]
  describe('getListings', () => {
    it('should return listings with pagination', async () => {
      (adminService.getAdminListings as jest.Mock).mockResolvedValue([{ id: 1 }]);
      req.query = { page: '2', limit: '5', status: 'pending' };

      await adminController.getListings(req as Request, res as Response);

      expect(adminService.getAdminListings).toHaveBeenCalledWith('pending', 2, 5);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });

    it('should return 500 on service error', async () => {
      (adminService.getAdminListings as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await adminController.getListings(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  // 2. Test updateListingStatusHandler [cite: 39]
  describe('updateListingStatusHandler', () => {
    it('should update listing status', async () => {
      req.params = { id: 'listing-1' };
      req.body = { status: 'approved' };
      (adminService.updateListingStatus as jest.Mock).mockResolvedValue({ id: 'listing-1', status: 'approved' });

      await adminController.updateListingStatusHandler(req as Request, res as Response);

      expect(adminService.updateListingStatus).toHaveBeenCalledWith('listing-1', 'approved', 'admin-id');
      expect(json).toHaveBeenCalled();
    });

    it('should return 404 if listing not found', async () => {
      (adminService.updateListingStatus as jest.Mock).mockRejectedValue(new Error('Listing not found'));
      await adminController.updateListingStatusHandler(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  // 3. Test getAdminStats [cite: 53]
  describe('getAdminStats', () => {
    it('should return stats data', async () => {
      req.query = { period: 'month' };
      (statsService.getStats as jest.Mock).mockResolvedValue({ total_users: 10 });

      await adminController.getAdminStats(req as Request, res as Response);

      expect(statsService.getStats).toHaveBeenCalledWith('month', undefined);
      expect(json).toHaveBeenCalledWith({ data: { total_users: 10 } });
    });
  });

  // 4. Test printStats (PDF) [cite: 56]
  describe('printStats', () => {
    it('should generate and send PDF', async () => {
      const mockBuffer = Buffer.from('pdf-content');
      (statsService.getStats as jest.Mock).mockResolvedValue({});
      (pdfGenerator.generateStatsPDF as jest.Mock).mockResolvedValue(mockBuffer);

      await adminController.printStats(req as Request, res as Response);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  // 5. Test updateUserStatusHandler [cite: 50]
  describe('updateUserStatusHandler', () => {
    it('should update user status', async () => {
      req.params = { id: 'user-1' };
      req.body = { status: 'banned' };
      (adminService.updateUserStatus as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await adminController.updateUserStatusHandler(req as Request, res as Response);
      expect(json).toHaveBeenCalled();
    });
  });
});