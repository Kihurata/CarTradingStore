import * as reportService from '../../../src/services/reportService';
import pool from '../../../src/config/database';
import * as auditService from '../../../src/services/auditService';

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../../../src/services/auditService');

describe('ReportService', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      const mockType = 'duplicate';
      
      const data = { listing_id: 'l1', reporter_id: 'u1', type: mockType };
      
      mockClient.query.mockResolvedValue({ rows: [{ id: 'r1', ...data }] });

      const res = await reportService.createReport(data as any );

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO reports'), expect.anything());
      expect(auditService.logAudit).toHaveBeenCalled();
      expect(res.id).toBe('r1');
    });

    it('should throw error if reporter info missing', async () => {
        const mockType = 'duplicate' as any;
        
        const data: any = { listing_id: 'l1', type: mockType }; 
        
        await expect(reportService.createReport(data)).rejects.toThrow('Either reporter_id or reporter_phone is required');
    });
  });

  describe('getReportsByListingId', () => {
    it('should return reports list', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'r1' }] });
      const res = await reportService.getReportsByListingId('l1');
      expect(res).toHaveLength(1);
    });
  });
});