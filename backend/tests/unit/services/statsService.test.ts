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
    it('should aggregate data from multiple queries', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })     
        .mockResolvedValueOnce({ rows: [{ approved: 50 }] })   
        .mockResolvedValueOnce({ rows: [{ total_reports: 5 }] }); 

      const result = await statsService.getStats('month');

      expect(result).toEqual({
        period: 'month',
        totalListings: 100,
        approvedListings: 50,
        totalReports: 5,
        dateFilter: undefined
      });
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });
});