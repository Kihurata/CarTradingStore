import * as adminService from '../../../src/services/adminService';
import pool from '../../../src/config/database';
import * as auditService from '../../../src/services/auditService';

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../../../src/services/auditService');

describe('AdminService', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  describe('getAdminListings', () => {
    it('should return listings with seller info', async () => {
      const mockRows = [{ id: '1', title: 'Car', seller_name: 'John', reports_count: '2' }];
      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adminService.getAdminListings('pending', 1, 10);
      
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT l.*'), expect.anything());
      expect(result).toEqual(mockRows);
    });
  });

  describe('updateListingStatus', () => {
    it('should update status using transaction and log audit', async () => {
      const listingId = '123';
      const adminId = 'admin-1';
      
      mockClient.query
        .mockResolvedValueOnce({}) 
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: listingId, status: 'approved' }] }) 
        .mockResolvedValueOnce({}); 

      const result = await adminService.updateListingStatus(listingId, 'approved' as any, adminId);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(auditService.logAudit).toHaveBeenCalledWith(adminId, 'listing.status.change', 'listing', listingId, expect.anything());
      expect(result).toEqual({ id: listingId, status: 'approved' });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback if error occurs', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error')); 

      await expect(adminService.updateListingStatus('1', 'approved' as any, 'admin')).rejects.toThrow('DB Error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'u1', status: 'banned' }] });
      
      const result = await adminService.updateUserStatus('u1', 'banned' as any, 'admin');
      
      expect(result).toEqual({ id: 'u1', status: 'banned' });
      expect(auditService.logAudit).toHaveBeenCalled();
    });
  });

  describe('updateListing (Admin Edit)', () => {
    it('should build dynamic update query and log audit', async () => {
      // Mock trả về listing sau khi update
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', title: 'New Title' }] });
      
      const updates = { title: 'New Title', price_vnd: 100 };
      const result = await adminService.updateListing('1', updates, 'admin-1');

      // Kiểm tra SQL dynamic
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE listings SET title = $1, price_vnd = $2'),
        expect.arrayContaining(['New Title', 100, '1'])
      );
      
      // Kiểm tra audit
      expect(auditService.logAudit).toHaveBeenCalledWith(
        'admin-1', 'listing.update', 'listing', '1', expect.anything()
      );
      expect(result).toEqual({ id: '1', title: 'New Title' });
    });

    it('should throw error if listing not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Trả về rỗng

      await expect(adminService.updateListing('999', { title: 'T' }, 'admin'))
        .rejects.toThrow('Listing not found');
    });
  });

  describe('getListingReports', () => {
    it('should fetch reports for a listing', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'r1', type: 'SPAM' }] });
      
      const res = await adminService.getListingReports('list-1');
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT r.*, u.name'),
        ['list-1']
      );
      expect(res).toHaveLength(1);
    });
  });

  describe('getAdminUsers', () => {
    it('should fetch users with status filter', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'u1' }] });
      
      await adminService.getAdminUsers('active' as any, 1, 10);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM users'),
        expect.arrayContaining(['active', 10, 0]) // status, limit, offset
      );
    });
  });

  // Bổ sung thêm test case lỗi cho updateUserStatus 
  describe('updateUserStatus Error', () => {
    it('should throw error if user not found', async () => {
       (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Không tìm thấy user
       
       await expect(adminService.updateUserStatus('u-999', 'banned' as any, 'admin'))
         .rejects.toThrow('User not found');
    });
  });

  // Bổ sung thêm test case lỗi cho updateListingStatus 
  describe('updateListingStatus Error', () => {
     it('should throw error if listing not found during status update', async () => {
        mockClient.query.mockResolvedValueOnce({}); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // Update trả về 0 dòng

        await expect(adminService.updateListingStatus('999', 'approved' as any, 'admin'))
          .rejects.toThrow('Listing not found');
          
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
     });
  });
});