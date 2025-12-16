import { Request, Response } from 'express';
import * as listingController from '../../../src/controllers/listingController';
import * as listingService from '../../../src/services/listingService';

jest.mock('../../../src/services/listingService');

describe('ListingController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    req = { params: {}, query: {}, body: {}, user: { id: 'user-id' }, files: [] } as any;
    res = { json, status } as any;
    jest.clearAllMocks();
  });

  describe('getAllListings', () => {
    /*
    [Description]: Kiểm tra xem API có lấy danh sách bài đăng và trả về dữ liệu phân trang (meta) chính xác hay không.
    [Pre-condition]: listingService.getAllListings hoạt động bình thường và trả về dữ liệu mock.
    [Data Test]: Request mặc định (query rỗng hoặc mặc định).
    [Steps]: 
      1. Mock listingService.getAllListings trả về { items: [], total: 0 }.
      2. Gọi hàm listingController.getAllListings(req, res).
    [Expected Result]: 
      - Service được gọi.
      - Response trả về JSON chứa object 'meta'.
    */
    it('should fetch listings and return meta data', async () => {
      (listingService.getAllListings as jest.Mock).mockResolvedValue({ items: [], total: 0 });
      
      await listingController.getAllListings(req as Request, res as Response);

      expect(listingService.getAllListings).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ meta: expect.any(Object) }));
    });
  });

  describe('createListing', () => {
    /*
    [Description]: Kiểm tra xem API có trả về lỗi 401 khi người dùng chưa đăng nhập (thiếu thông tin user trong request).
    [Pre-condition]: Không có user trong request.
    [Data Test]: req.user = undefined
    [Steps]: 
      1. Gán req.user = undefined.
      2. Gọi hàm listingController.createListing(req, res).
    [Expected Result]: Response trả về status code 401.
    */
    it('should return 401 if no user', async () => {
      req.user = undefined;
      await listingController.createListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(401);
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi dữ liệu đầu vào không hợp lệ (ví dụ: thiếu tiêu đề).
    [Pre-condition]: User đã đăng nhập.
    [Data Test]: req.body = { title: '' } (Title rỗng).
    [Steps]: 
      1. Gán body thiếu thông tin hợp lệ.
      2. Gọi hàm listingController.createListing(req, res).
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 validation error', async () => {
      req.body = { title: '' };
      await listingController.createListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    /*
    [Description]: Kiểm tra quy trình tạo bài đăng thành công và trả về ID của bài đăng mới.
    [Pre-condition]: Dữ liệu đầu vào hợp lệ, Service hoạt động tốt.
    [Data Test]: req.body = { title: 'Car', price_vnd: '100', brand_id: '1', model_id: '1', year: '2020' }
    [Steps]: 
      1. Mock listingService.createListing trả về { id: 'new-id' }.
      2. Gọi hàm listingController.createListing(req, res).
    [Expected Result]: 
      - Response trả về status code 201.
      - JSON response chứa { id: 'new-id' }.
    */
    it('should create listing successfully', async () => {
      req.body = { title: 'Car', price_vnd: '100', brand_id: '1', model_id: '1', year: '2020' };
      (listingService.createListing as jest.Mock).mockResolvedValue({ id: 'new-id' });

      await listingController.createListing(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-id' }));
    });
  });

  describe('updateListingStatus', () => {
    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi trạng thái cập nhật (status) không hợp lệ hay không.
    [Pre-condition]: User có quyền thực hiện.
    [Data Test]: req.body = { status: 'invalid' }
    [Steps]: 
      1. Gán status không nằm trong enum cho phép.
      2. Gọi hàm listingController.updateListingStatus(req, res).
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 for invalid status', async () => {
      req.body = { status: 'invalid' };
      await listingController.updateListingStatus(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    /*
    [Description]: Kiểm tra xem API có cập nhật trạng thái bài đăng thành công khi dữ liệu hợp lệ hay không.
    [Pre-condition]: Status hợp lệ, Service update thành công.
    [Data Test]: req.params = { id: '1' }, req.body = { status: 'approved' }
    [Steps]: 
      1. Mock listingService.updateListingStatus trả về thành công.
      2. Gọi hàm listingController.updateListingStatus(req, res).
    [Expected Result]: 
      - Service được gọi với đúng ID, status và user ID.
      - Response trả về JSON thành công.
    */
    it('should update status successfully', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      (listingService.updateListingStatus as jest.Mock).mockResolvedValue({});

      await listingController.updateListingStatus(req as Request, res as Response);

      expect(listingService.updateListingStatus).toHaveBeenCalledWith('1', 'approved', 'user-id');
      expect(json).toHaveBeenCalled();
    });
  });

  describe('getListing', () => {
    /*
    [Description]: Kiểm tra xem API có trả về chi tiết bài đăng chính xác khi tìm thấy ID hay không.
    [Pre-condition]: Listing ID tồn tại trong hệ thống.
    [Data Test]: req.params = { id: '1' }
    [Steps]: 
      1. Mock listingService.getListingById trả về object { id: '1' }.
      2. Gọi hàm listingController.getListing(req, res).
    [Expected Result]: Response JSON trả về đúng data object.
    */
    it('should return listing detail', async () => {
      req.params = { id: '1' };
      (listingService.getListingById as jest.Mock).mockResolvedValue({ id: '1' });
      
      await listingController.getListing(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: { id: '1' } });
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 404 khi không tìm thấy bài đăng với ID cung cấp hay không.
    [Pre-condition]: Listing ID không tồn tại.
    [Data Test]: req.params = { id: 'any' }
    [Steps]: 
      1. Mock listingService.getListingById trả về null.
      2. Gọi hàm listingController.getListing(req, res).
    [Expected Result]: Response trả về status code 404.
    */
    it('should return 404 if not found', async () => {
      (listingService.getListingById as jest.Mock).mockResolvedValue(null);
      await listingController.getListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  describe('getAllListings Filters', () => {
    /*
    [Description]: Kiểm tra xem các tham số lọc (giá, từ khóa, sắp xếp) có được truyền chính xác xuống service hay không.
    [Pre-condition]: Request chứa query parameters đầy đủ.
    [Data Test]: req.query = { min_price: '100', max_price: '500', q: 'toyota', sort: 'price_asc' }
    [Steps]: 
      1. Mock listingService.getAllListings.
      2. Gọi hàm listingController.getAllListings với query params.
    [Expected Result]: Service getAllListings được gọi với đúng object filters đã parse.
    */
    it('should pass filter params correctly to service', async () => {
      req.query = { 
        min_price: '100', 
        max_price: '500', 
        q: 'toyota', 
        sort: 'price_asc' 
      };
      (listingService.getAllListings as jest.Mock).mockResolvedValue({ items: [], total: 0 });

      await listingController.getAllListings(req as Request, res as Response);

      expect(listingService.getAllListings).toHaveBeenCalledWith(
        'approved', // Default status
        1, // Default page
        12, // Default limit
        expect.objectContaining({
          min_price: 100,
          max_price: 500,
          q: 'toyota',
          sort: 'price_asc'
        })
      );
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi tham số giá không phải là số hợp lệ hay không.
    [Pre-condition]: Tham số min_price hoặc max_price là chuỗi không phải số.
    [Data Test]: req.query = { min_price: 'invalid' }
    [Steps]: 
      1. Gán min_price sai định dạng.
      2. Gọi hàm listingController.getAllListings.
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 for invalid price', async () => {
      req.query = { min_price: 'invalid' };
      await listingController.getAllListings(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteListing', () => {
    /*
    [Description]: Kiểm tra xem API có xóa bài đăng thành công và trả về thông báo xác nhận hay không.
    [Pre-condition]: Listing ID tồn tại và xóa thành công.
    [Data Test]: req.params = { id: '1' }
    [Steps]: 
      1. Mock listingService.deleteListing trả về { success: true }.
      2. Gọi hàm listingController.deleteListing(req, res).
    [Expected Result]: Response JSON chứa data: { success: true }.
    */
    it('should delete listing successfully', async () => {
      req.params = { id: '1' };
      (listingService.deleteListing as jest.Mock).mockResolvedValue({ success: true });
      
      await listingController.deleteListing(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: { success: true } });
    });

    /*
    [Description]: Kiểm tra xem API có xử lý lỗi (ví dụ trả về 404) khi quá trình xóa gặp sự cố (như không tìm thấy hoặc lỗi DB).
    [Pre-condition]: Service ném ra lỗi khi xóa.
    [Data Test]: req.params = { id: '1' }
    [Steps]: 
      1. Mock listingService.deleteListing ném ra Error 'DB Error'.
      2. Gọi hàm listingController.deleteListing(req, res).
    [Expected Result]: Response trả về status code 404.
    */
    it('should handle errors', async () => {
      (listingService.deleteListing as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await listingController.deleteListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404); 
    });
  });

  describe('editListing', () => {
    /*
    [Description]: Kiểm tra xem API có từ chối quyền truy cập (lỗi 401) khi người dùng chưa xác thực (req.user undefined).
    [Pre-condition]: Không có user session.
    [Data Test]: req.user = undefined
    [Steps]: 
      1. Gọi hàm listingController.editListing(req, res).
    [Expected Result]: Response trả về status code 401.
    */
    it('should return 401 if unauthorized', async () => {
      req.user = undefined;
      await listingController.editListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(401);
    });

    /*
    [Description]: Kiểm tra quy trình chỉnh sửa bài đăng thành công, bao gồm việc xử lý hình ảnh cần xóa và cập nhật thông tin mới.
    [Pre-condition]: User có quyền sở hữu, dữ liệu hợp lệ.
    [Data Test]: req.params.id='1', title='New Title', 'delete_image_ids[]'=['img1']
    [Steps]: 
      1. Mock user và input body.
      2. Mock listingService.updateListing trả về object đã update.
      3. Gọi hàm listingController.editListing(req, res).
    [Expected Result]: 
      - Service updateListing được gọi với đúng các tham số (id, updates, images, delete_ids, user_id).
      - Response thành công.
    */
    it('should update listing successfully', async () => {
      req.user = { id: 'owner-id' ,is_admin:false};
      req.params = { id: '1' };
      req.body = { title: 'New Title', 'delete_image_ids[]': ['img1'] };
      req.files = []; 
      (listingService.updateListing as jest.Mock).mockResolvedValue({ id: '1', title: 'New Title' });

      await listingController.editListing(req as Request, res as Response);
      
      expect(listingService.updateListing).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'New Title' }),
        [],
        ['img1'],
        'owner-id'
      );
      expect(json).toHaveBeenCalled();
    });
  });

  describe('Auxiliary Data', () => {
    /*
    [Description]: Kiểm tra xem API có trả về danh sách dòng xe (models) dựa trên mã thương hiệu (brand_id) hay không.
    [Pre-condition]: brand_id hợp lệ.
    [Data Test]: req.query = { brand_id: '1' }
    [Steps]: 
      1. Mock listingService.listModelsByBrand trả về mảng rỗng [].
      2. Gọi hàm listingController.getModelsByBrand(req, res).
    [Expected Result]: Response JSON trả về { data: [] }.
    */
    it('should get models by brand', async () => {
      req.query = { brand_id: '1' };
      (listingService.listModelsByBrand as jest.Mock).mockResolvedValue([]);
      
      await listingController.getModelsByBrand(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: [] });
    });

    /*
    [Description]: Kiểm tra xem API có trả về lỗi 400 khi thiếu tham số brand_id bắt buộc hay không.
    [Pre-condition]: Request thiếu query param.
    [Data Test]: req.query = {}
    [Steps]: 
      1. Gọi hàm listingController.getModelsByBrand với query rỗng.
    [Expected Result]: Response trả về status code 400.
    */
    it('should return 400 if brand_id missing', async () => {
      req.query = {};
      await listingController.getModelsByBrand(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  // describe('createListing - INTENTIONAL FAIL', () => {
  //   /*
  //   [Description]: Kiểm tra xem API có tạo bài đăng thành công không (nhưng cố tình truyền title rỗng).
  //   [Pre-condition]: User đã đăng nhập.
  //   [Data Test]: req.body = { title: '', price_vnd: '100', brand_id: '1' }
  //   [Steps]: 
  //     1. Mock listingService.createListing trả về { id: 'new-id' }.
  //     2. Gọi hàm listingController.createListing(req, res).
  //   [Expected Result]: Response trả về status code 201 (nhưng thực tế sẽ là 400 do validation).
  //   */
  //   it('should create listing successfully even with empty title', async () => {
  //     req.body = { title: '', price_vnd: '100', brand_id: '1' }; 
  //     (listingService.createListing as jest.Mock).mockResolvedValue({ id: 'new-id' });

  //     await listingController.createListing(req as Request, res as Response);

  //     expect(status).toHaveBeenCalledWith(201); 
  //   });
  // });
});