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
    /*
    [Description]: Kiểm tra xem service có trả về danh sách bài đăng kèm theo thông tin người bán và số lượng báo cáo hay không.
    [Pre-condition]: Database hoạt động và trả về dữ liệu mock.
    [Data Test]: status='pending', page=1, limit=10
    [Steps]: 
      1. Mock pool.query trả về mảng chứa thông tin listing và seller_name.
      2. Gọi hàm adminService.getAdminListings('pending', 1, 10).
    [Expected Result]: 
      - pool.query được gọi với câu lệnh SELECT chính xác.
      - Hàm trả về đúng mảng mockRows.
    */
    it('should return listings with seller info', async () => {
      const mockRows = [{ id: '1', title: 'Car', seller_name: 'John', reports_count: '2' }];
      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adminService.getAdminListings('pending', 1, 10);
      
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT l.*'), expect.anything());
      expect(result).toEqual(mockRows);
    });
  });

  describe('updateListingStatus', () => {
    /*
    [Description]: Kiểm tra quy trình cập nhật trạng thái bài đăng thành công, sử dụng transaction và ghi log audit.
    [Pre-condition]: Kết nối DB thành công, Listing tồn tại.
    [Data Test]: listingId='123', status='approved', adminId='admin-1'
    [Steps]: 
      1. Mock pool.connect trả về client.
      2. Mock client.query lần lượt: BEGIN, UPDATE (thành công), COMMIT.
      3. Gọi hàm adminService.updateListingStatus.
    [Expected Result]: 
      - Transaction được thực hiện (BEGIN -> COMMIT).
      - Audit log được ghi lại.
      - Trả về object chứa trạng thái mới.
    */
    it('should update status using transaction and log audit', async () => {
      const listingId = '123';
      const adminId = 'admin-1';
      
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: listingId, status: 'approved' }] }) // UPDATE
        .mockResolvedValueOnce({}); // COMMIT

      const result = await adminService.updateListingStatus(listingId, 'approved' as any, adminId);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(auditService.logAudit).toHaveBeenCalledWith(adminId, 'listing.status.change', 'listing', listingId, expect.anything());
      expect(result).toEqual({ id: listingId, status: 'approved' });
      expect(mockClient.release).toHaveBeenCalled();
    });

    /*
    [Description]: Kiểm tra xem transaction có được ROLLBACK (hoàn tác) nếu có lỗi xảy ra trong quá trình cập nhật hay không.
    [Pre-condition]: Database gặp lỗi khi query.
    [Data Test]: listingId='1', status='approved', adminId='admin'
    [Steps]: 
      1. Mock client.query ném ra lỗi 'DB Error'.
      2. Gọi hàm adminService.updateListingStatus.
    [Expected Result]: 
      - Ném ra lỗi 'DB Error'.
      - Transaction được ROLLBACK.
      - Kết nối client được release.
    */
    it('should rollback if error occurs', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error')); 

      await expect(adminService.updateListingStatus('1', 'approved' as any, 'admin')).rejects.toThrow('DB Error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    /*
    [Description]: Kiểm tra xem service có cập nhật trạng thái người dùng (ví dụ: cấm) thành công và ghi log audit hay không.
    [Pre-condition]: User tồn tại.
    [Data Test]: userId='u1', status='banned', adminId='admin'
    [Steps]: 
      1. Mock pool.query thực hiện UPDATE trả về row đã update.
      2. Gọi hàm adminService.updateUserStatus.
    [Expected Result]: 
      - Hàm trả về user với status 'banned'.
      - Audit log được gọi.
    */
    it('should update user status', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'u1', status: 'banned' }] });
      
      const result = await adminService.updateUserStatus('u1', 'banned' as any, 'admin');
      
      expect(result).toEqual({ id: 'u1', status: 'banned' });
      expect(auditService.logAudit).toHaveBeenCalled();
    });
  });

  describe('updateListing (Admin Edit)', () => {
    /*
    [Description]: Kiểm tra xem service có tạo truy vấn cập nhật động (dynamic update query) và ghi log audit cho hành động chỉnh sửa của admin hay không.
    [Pre-condition]: Listing tồn tại.
    [Data Test]: listingId='1', updates={ title: 'New Title', price_vnd: 100 }
    [Steps]: 
      1. Mock pool.query UPDATE trả về row đã update.
      2. Gọi hàm adminService.updateListing.
    [Expected Result]: 
      - SQL Query chứa đúng các trường cần update (title, price_vnd).
      - Audit log được ghi với action 'listing.update'.
    */
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

    /*
    [Description]: Kiểm tra xem service có báo lỗi nếu không tìm thấy bài đăng cần chỉnh sửa hay không.
    [Pre-condition]: Listing ID không tồn tại.
    [Data Test]: listingId='999'
    [Steps]: 
      1. Mock pool.query trả về rows rỗng [].
      2. Gọi hàm adminService.updateListing.
    [Expected Result]: Ném ra lỗi 'Listing not found'.
    */
    it('should throw error if listing not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Trả về rỗng

      await expect(adminService.updateListing('999', { title: 'T' }, 'admin'))
        .rejects.toThrow('Listing not found');
    });
  });

  describe('getListingReports', () => {
    /*
    [Description]: Kiểm tra xem service có lấy được danh sách báo cáo (reports) cho một bài đăng cụ thể hay không.
    [Pre-condition]: Có report trong DB.
    [Data Test]: listingId='list-1'
    [Steps]: 
      1. Mock pool.query trả về mảng reports.
      2. Gọi hàm adminService.getListingReports.
    [Expected Result]: 
      - Query SELECT chính xác kèm thông tin người báo cáo (u.name).
      - Trả về mảng reports.
    */
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
    /*
    [Description]: Kiểm tra xem service có lấy được danh sách người dùng kèm theo bộ lọc trạng thái và phân trang hay không.
    [Pre-condition]: Database hoạt động.
    [Data Test]: status='active', page=1, limit=10
    [Steps]: 
      1. Mock pool.query trả về danh sách user.
      2. Gọi hàm adminService.getAdminUsers.
    [Expected Result]: SQL Query chứa điều kiện lọc status và phân trang (LIMIT, OFFSET).
    */
    it('should fetch users with status filter', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'u1' }] });
      
      await adminService.getAdminUsers('active' as any, 1, 10);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM users'),
        expect.arrayContaining(['active', 10, 0]) // status, limit, offset
      );
    });
  });

  describe('updateUserStatus Error', () => {
    /*
    [Description]: Kiểm tra xem service có báo lỗi 'User not found' nếu không tìm thấy người dùng khi cập nhật trạng thái hay không.
    [Pre-condition]: User ID không tồn tại.
    [Data Test]: userId='u-999'
    [Steps]: 
      1. Mock pool.query trả về rows rỗng [].
      2. Gọi hàm adminService.updateUserStatus.
    [Expected Result]: Ném ra lỗi 'User not found'.
    */
    it('should throw error if user not found', async () => {
       (pool.query as jest.Mock).mockResolvedValue({ rows: [] }); // Không tìm thấy user
       
       await expect(adminService.updateUserStatus('u-999', 'banned' as any, 'admin'))
         .rejects.toThrow('User not found');
    });
  });

  describe('updateListingStatus Error', () => {
     /*
     [Description]: Kiểm tra xem transaction có được rollback và báo lỗi 'Listing not found' nếu không tìm thấy bài đăng để cập nhật trạng thái hay không.
     [Pre-condition]: Transaction bắt đầu nhưng câu lệnh UPDATE không tìm thấy bản ghi.
     [Data Test]: listingId='999'
     [Steps]: 
       1. Mock BEGIN thành công.
       2. Mock UPDATE trả về rowCount: 0.
       3. Gọi hàm adminService.updateListingStatus.
     [Expected Result]: 
       - Ném ra lỗi 'Listing not found'.
       - Transaction thực hiện ROLLBACK.
     */
     it('should throw error if listing not found during status update', async () => {
       mockClient.query.mockResolvedValueOnce({}); // BEGIN
       mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // Update trả về 0 dòng

       await expect(adminService.updateListingStatus('999', 'approved' as any, 'admin'))
         .rejects.toThrow('Listing not found');
         
       expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
     });
  });
});