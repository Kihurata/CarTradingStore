import * as statsService from '../../../src/services/statsService';
import pool from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('StatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    /*
    [Description]: Kiểm tra xem service có tổng hợp dữ liệu từ nhiều truy vấn (bài đăng, báo cáo,...) và trả về kết quả thống kê hay không.
    [Pre-condition]: Database hoạt động bình thường, các query trả về dữ liệu mock.
    [Data Test]: period = 'month'
    [Steps]: 
      1. Mock pool.query lần 1 trả về total listings (100).
      2. Mock pool.query lần 2 trả về approved listings (50).
      3. Mock pool.query lần 3 trả về total reports (5).
      4. Gọi hàm statsService.getStats('month').
    [Expected Result]: 
      - Hàm trả về object thống kê đúng cấu trúc và giá trị.
      - Database query được gọi đúng 3 lần.
    */
    it('should aggregate data from multiple queries', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })      // Tổng Listings
        .mockResolvedValueOnce({ rows: [{ approved: 50 }] })   // Listings đã duyệt
        .mockResolvedValueOnce({ rows: [{ total_reports: 5 }] }); // Tổng Reports

      const result = await statsService.getStats('month');

      expect(result).toEqual({
        period: 'month',
        totalListings: 100,
        approvedListings: 50,
        totalReports: 5,
        dateFilter: undefined
      });
      // Đảm bảo tất cả các truy vấn cần thiết đã được gọi
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });
});