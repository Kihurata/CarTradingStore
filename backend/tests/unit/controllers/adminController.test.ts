import { Request, Response } from 'express';
import * as adminController from '../../../src/controllers/adminController';
import * as adminService from '../../../src/services/adminService';
import * as statsService from '../../../src/services/statsService';
import * as pdfGenerator from '../../../src/utils/pdfGenerator';
import pool from '../../../src/config/database';

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

  describe('getListings', () => {
    /*
    [Description]: Kiểm tra xem danh sách bài đăng có được trả về chính xác kèm theo phân trang hay không.
    [Pre-condition]: adminService.getAdminListings được mock trả về dữ liệu thành công.
    [Data Test]: req.query = { page: '2', limit: '5', status: 'pending' }
    [Steps]: 
      1. Mock adminService.getAdminListings trả về mảng [{ id: 1 }]
      2. Gọi hàm adminController.getListings(req, res)
    [Expected Result]: 
      - Service được gọi với tham số ('pending', 2, 5)
      - Response trả về JSON chứa object có page: 2
    */
    it('should return listings with pagination', async () => {
      (adminService.getAdminListings as jest.Mock).mockResolvedValue([{ id: 1 }]);
      req.query = { page: '2', limit: '5', status: 'pending' };

      await adminController.getListings(req as Request, res as Response);

      expect(adminService.getAdminListings).toHaveBeenCalledWith('pending', 2, 5);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });

    /*
    [Description]: Kiểm tra xem server có trả về mã lỗi 500 khi service gặp sự cố hay không.
    [Pre-condition]: adminService.getAdminListings gặp lỗi (throws Error).
    [Data Test]: Không có (sử dụng default req)
    [Steps]: 
      1. Mock adminService.getAdminListings ném ra lỗi 'DB Error'
      2. Gọi hàm adminController.getListings(req, res)
    [Expected Result]: Response trả về status code 500.
    */
    it('should return 500 on service error', async () => {
      (adminService.getAdminListings as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await adminController.getListings(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateListingStatusHandler', () => {
    /*
    [Description]: Kiểm tra xem trạng thái bài đăng có được cập nhật thành công hay không.
    [Pre-condition]: User có quyền admin, Listing ID tồn tại.
    [Data Test]: req.params = { id: 'listing-1' }, req.body = { status: 'approved' }
    [Steps]: 
      1. Mock adminService.updateListingStatus trả về object đã update
      2. Gọi hàm adminController.updateListingStatusHandler(req, res)
    [Expected Result]: 
      - Service được gọi đúng tham số
      - Response trả về JSON kết quả thành công
    */
    it('should update listing status', async () => {
      req.params = { id: 'listing-1' };
      req.body = { status: 'approved' };
      (adminService.updateListingStatus as jest.Mock).mockResolvedValue({ id: 'listing-1', status: 'approved' });

      await adminController.updateListingStatusHandler(req as Request, res as Response);

      expect(adminService.updateListingStatus).toHaveBeenCalledWith('listing-1', 'approved', 'admin-id');
      expect(json).toHaveBeenCalled();
    });

    /*
    [Description]: Kiểm tra xem server có trả về mã lỗi 404 nếu không tìm thấy bài đăng hay không.
    [Pre-condition]: Listing ID không tồn tại trong hệ thống.
    [Data Test]: req.params = { id: 'listing-1' }
    [Steps]: 
      1. Mock adminService.updateListingStatus ném lỗi 'Listing not found'
      2. Gọi hàm adminController.updateListingStatusHandler(req, res)
    [Expected Result]: Response trả về status code 404.
    */
    it('should return 404 if listing not found', async () => {
      (adminService.updateListingStatus as jest.Mock).mockRejectedValue(new Error('Listing not found'));
      await adminController.updateListingStatusHandler(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  describe('getAdminStats', () => {
    /*
    [Description]: Kiểm tra xem dữ liệu thống kê quản trị viên có được trả về đúng hay không.
    [Pre-condition]: statsService hoạt động bình thường.
    [Data Test]: req.query = { period: 'month' }
    [Steps]: 
      1. Mock statsService.getStats trả về { total_users: 10 }
      2. Gọi hàm adminController.getAdminStats(req, res)
    [Expected Result]: 
      - Service gọi đúng tham số period 'month'
      - Response trả về JSON data: { total_users: 10 }
    */
    it('should return stats data', async () => {
      req.query = { period: 'month' };
      (statsService.getStats as jest.Mock).mockResolvedValue({ total_users: 999 });/* sửa test fail để test issue logger github*/

      await adminController.getAdminStats(req as Request, res as Response);

      expect(statsService.getStats).toHaveBeenCalledWith('month', undefined);
      expect(json).toHaveBeenCalledWith({ data: { total_users: 10 } });
    });
  });

  describe('printStats', () => {
    /*
    [Description]: Kiểm tra xem hệ thống có tạo và gửi file PDF thống kê về client hay không.
    [Pre-condition]: statsService trả về data và pdfGenerator tạo được buffer.
    [Data Test]: Không có
    [Steps]: 
      1. Mock statsService.getStats trả về {}
      2. Mock pdfGenerator.generateStatsPDF trả về Buffer 'pdf-content'
      3. Gọi hàm adminController.printStats(req, res)
    [Expected Result]: 
      - Header Content-Type được set là 'application/pdf'
      - Response send() được gọi với đúng buffer mock
    */
    it('should generate and send PDF', async () => {
      const mockBuffer = Buffer.from('pdf-content');
      (statsService.getStats as jest.Mock).mockResolvedValue({});
      (pdfGenerator.generateStatsPDF as jest.Mock).mockResolvedValue(mockBuffer);

      await adminController.printStats(req as Request, res as Response);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('updateUserStatusHandler', () => {
    /*
    [Description]: Kiểm tra xem trạng thái người dùng có được cập nhật thành công hay không.
    [Pre-condition]: User ID tồn tại.
    [Data Test]: req.params = { id: 'user-1' }, req.body = { status: 'banned' }
    [Steps]: 
      1. Mock adminService.updateUserStatus trả về user đã update
      2. Gọi hàm adminController.updateUserStatusHandler(req, res)
    [Expected Result]: Response trả về JSON thành công.
    */
    it('should update user status', async () => {
      req.params = { id: 'user-1' };
      req.body = { status: 'banned' };
      (adminService.updateUserStatus as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await adminController.updateUserStatusHandler(req as Request, res as Response);
      expect(json).toHaveBeenCalled();
    });
  });
});