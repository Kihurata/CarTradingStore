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
    /*
    [Description]: Kiểm tra xem báo cáo có được tạo thành công khi dữ liệu đầu vào hợp lệ hay không.
    [Pre-condition]: Dữ liệu đầu vào đầy đủ, Service hoạt động tốt.
    [Data Test]: req.body = { listing_id: '1', type: 'spam', note: 'bad' }
    [Steps]: 
      1. Mock reportService.createReport trả về object { id: 'rp-1' }.
      2. Gọi hàm reportController.createReport(req, res).
    [Expected Result]: 
      - Response trả về status code 201.
      - Service createReport được gọi.
    */
    it('should create report successfully', async () => {
      req.body = { listing_id: '1', type: 'spam', note: 'bad' };
      (reportService.createReport as jest.Mock).mockResolvedValue({ id: 'rp-1' });

      await reportController.createReport(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(reportService.createReport).toHaveBeenCalled();
    });

    /*
    [Description]: Kiểm tra xem API có trả về mã lỗi 400 khi quá trình tạo báo cáo gặp sự cố (ví dụ: lỗi service).
    [Pre-condition]: Service gặp lỗi khi xử lý.
    [Data Test]: req.body hợp lệ (nhưng service fail).
    [Steps]: 
      1. Mock reportService.createReport ném ra Error 'Fail'.
      2. Gọi hàm reportController.createReport(req, res).
    [Expected Result]: Response trả về status code 400.
    */
    it('should handle errors', async () => {
      (reportService.createReport as jest.Mock).mockRejectedValue(new Error('Fail'));
      await reportController.createReport(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateReportStatusController', () => {
    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi trạng thái cập nhật không hợp lệ (không nằm trong danh sách enum cho phép).
    [Pre-condition]: Request chứa status sai định dạng.
    [Data Test]: req.body = { status: 'invalid_status' }
    [Steps]: 
      1. Gán body chứa status không hợp lệ.
      2. Gọi hàm reportController.updateReportStatusController(req, res).
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 for invalid status', async () => {
      req.body = { status: 'invalid_status' };
      await reportController.updateReportStatusController(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    /*
    [Description]: Kiểm tra quy trình cập nhật trạng thái báo cáo thành công và đảm bảo service được gọi với đúng tham số.
    [Pre-condition]: Status hợp lệ, Service update thành công.
    [Data Test]: req.params = { reportId: '1' }, req.body = { status: ReportStatus.RESOLVED }
    [Steps]: 
      1. Mock reportService.updateReportStatus trả về thành công.
      2. Gọi hàm reportController.updateReportStatusController(req, res).
    [Expected Result]: 
      - Service được gọi với đúng reportId, status và user ID.
      - Response trả về JSON thành công.
    */
    it('should update report status', async () => {
      req.params = { reportId: '1' };
      req.body = { status: ReportStatus.RESOLVED };
      (reportService.updateReportStatus as jest.Mock).mockResolvedValue({});

      await reportController.updateReportStatusController(req as Request, res as Response);

      expect(reportService.updateReportStatus).toHaveBeenCalledWith('1', ReportStatus.RESOLVED, 'user-id');
      expect(json).toHaveBeenCalled();
    });
  });

  // describe('updateReportStatusController - INTENTIONAL FAIL', () => {
  //   /*
  //   [Description]: Kiểm tra API cập nhật trạng thái báo cáo với status không nằm trong danh sách cho phép.
  //   [Pre-condition]: Admin đã đăng nhập.
  //   [Data Test]: req.body = { status: 'DANG_XEM_XET' } (Tiếng Việt không hỗ trợ).
  //   [Steps]: 
  //     1. Mock reportService.updateReportStatus thành công.
  //     2. Gọi hàm reportController.updateReportStatusController(req, res).
  //   [Expected Result]: Response trả về status code 200 (nhưng thực tế Controller chặn 400).
  //   */
  //   it('should update report status with invalid enum string', async () => {
  //     req.params = { reportId: '1' };
  //     req.body = { status: 'DANG_XEM_XET' };
  //     (reportService.updateReportStatus as jest.Mock).mockResolvedValue({});

  //     await reportController.updateReportStatusController(req as Request, res as Response);

  //     // Fail tại đây: Controller thực tế check enum và trả 400, nhưng ta expect 200
  //     expect(status).toHaveBeenCalledWith(200);
  //   });
  // });
});