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
    /*
    [Description]: Kiểm tra quy trình tạo báo cáo thành công, sử dụng transaction và ghi log audit.
    [Pre-condition]: Database kết nối thành công, Mock client hoạt động.
    [Data Test]: data = { listing_id: 'l1', reporter_id: 'u1', type: 'duplicate' }
    [Steps]: 
      1. Mock client.query trả về row đã insert ({ id: 'r1', ... }).
      2. Gọi hàm reportService.createReport(data).
    [Expected Result]: 
      - Transaction (BEGIN, INSERT) được gọi.
      - Audit log được ghi.
      - Hàm trả về object có id 'r1'.
    */
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

    /*
    [Description]: Kiểm tra xem service có ném lỗi nếu thiếu thông tin người báo cáo (reporter_id hoặc reporter_phone) hay không.
    [Pre-condition]: Không có (Validation check).
    [Data Test]: data = { listing_id: 'l1', type: 'duplicate' } (Thiếu reporter info).
    [Steps]: 
      1. Gọi hàm reportService.createReport(data) với dữ liệu thiếu.
    [Expected Result]: Ném ra lỗi 'Either reporter_id or reporter_phone is required'.
    */
    it('should throw error if reporter info missing', async () => {
        const mockType = 'duplicate' as any;
        
        const data: any = { listing_id: 'l1', type: mockType }; 
        
        await expect(reportService.createReport(data)).rejects.toThrow('Either reporter_id or reporter_phone is required');
    });
  });

  describe('getReportsByListingId', () => {
    /*
    [Description]: Kiểm tra xem service có trả về danh sách báo cáo cho một bài đăng cụ thể hay không.
    [Pre-condition]: Database hoạt động bình thường.
    [Data Test]: listingId = 'l1'
    [Steps]: 
      1. Mock pool.query trả về mảng reports.
      2. Gọi hàm reportService.getReportsByListingId('l1').
    [Expected Result]: Trả về mảng có độ dài 1.
    */
    it('should return reports list', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'r1' }] });
      const res = await reportService.getReportsByListingId('l1');
      expect(res).toHaveLength(1);
    });
  });
});