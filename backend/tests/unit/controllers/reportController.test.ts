import { Request, Response } from 'express';
import * as reportController from '../../../src/controllers/reportController';
import * as reportService from '../../../src/services/reportService';
import { ReportStatus } from '../../../src/models/report';

jest.mock('../../../src/services/reportService');

describe('ReportController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    req = { params: {}, query: {}, body: {}, user: { id: 'user-id' } } as any;
    res = { json, status } as any;
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      req.body = { listing_id: '1', type: 'spam', note: 'bad' };
      (reportService.createReport as jest.Mock).mockResolvedValue({ id: 'rp-1' });

      await reportController.createReport(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(reportService.createReport).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (reportService.createReport as jest.Mock).mockRejectedValue(new Error('Fail'));
      await reportController.createReport(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateReportStatusController', () => {
    it('should return 400 for invalid status', async () => {
      req.body = { status: 'invalid_status' };
      await reportController.updateReportStatusController(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it('should update report status', async () => {
      req.params = { reportId: '1' };
      req.body = { status: ReportStatus.RESOLVED };
      (reportService.updateReportStatus as jest.Mock).mockResolvedValue({});

      await reportController.updateReportStatusController(req as Request, res as Response);

      expect(reportService.updateReportStatus).toHaveBeenCalledWith('1', ReportStatus.RESOLVED, 'user-id');
      expect(json).toHaveBeenCalled();
    });
  });
});