import * as listingService from '../../../src/services/listingService';
import pool from '../../../src/config/database';
import { supabase } from '../../../src/utils/supabase';
import * as auditService from '../../../src/services/auditService';

// --- MOCKS ---
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

jest.mock('../../../src/utils/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    },
  },
}));

jest.mock('../../../src/services/auditService');

describe('ListingService Unit Tests', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Transaction Client
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  // 1. getAllListings
  describe('getAllListings', () => {
    /*
    [Description]: Kiểm tra xem service có xây dựng truy vấn kèm theo các bộ lọc (filters) và trả về dữ liệu cùng tổng số lượng chính xác hay không.
    [Pre-condition]: Database query trả về dữ liệu mock.
    [Data Test]: status='approved', page=1, limit=10, filters={ min_price: 100, sort: 'price_asc' }
    [Steps]: 
      1. Mock pool.query trả về mảng listings và count.
      2. Gọi hàm listingService.getAllListings.
    [Expected Result]: 
      - Trả về object chứa items và total.
      - Câu lệnh SQL chứa các điều kiện lọc (price_vnd >= ...).
    */
    it('should build query with filters and return data', async () => {
      const mockRows = [
        { id: '1', title: 'Camry', total_count: '10', price_vnd: 500 }
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const filters = { min_price: 100, sort: 'price_asc' as const };
      const result = await listingService.getAllListings('approved', 1, 10, filters);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(10);
      
      // Kiểm tra SQL chứa điều kiện lọc
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('l.price_vnd >='), 
        expect.anything()
      );
    });
  });

  // 2. createListing
  describe('createListing', () => {
    /*
    [Description]: Kiểm tra quy trình tạo bài đăng thành công: sử dụng transaction, upload ảnh lên Supabase, chèn dữ liệu vào DB và ghi log audit.
    [Pre-condition]: Mock Supabase thành công, Mock DB connect thành công.
    [Data Test]: inputData đầy đủ (seller_id, title, price, brand, model, year, images).
    [Steps]: 
      1. Mock client.query cho Transaction (BEGIN, INSERT, COMMIT).
      2. Mock Supabase upload và getPublicUrl.
      3. Gọi hàm listingService.createListing.
    [Expected Result]: 
      - Transaction được thực hiện đầy đủ.
      - 2 câu lệnh INSERT (listings, listing_images) được gọi.
      - Audit log được ghi.
      - Trả về object có id.
    */
    it('should create listing with images inside transaction', async () => {
      const inputData = {
        seller_id: 'user1',
        title: 'New Car',
        price_vnd: 1000,
        brand_id: 1,
        model_id: 1,
        year: 2020,
        images: [{ originalname: 'test.jpg', buffer: Buffer.from('img'), mimetype: 'image/jpeg' }] as any
      };

      mockClient.query.mockResolvedValue({}); // BEGIN, INSERT...

      (supabase.storage.from('bucket').upload as jest.Mock).mockResolvedValue({ error: null });
      (supabase.storage.from('bucket').getPublicUrl as jest.Mock).mockReturnValue({ data: { publicUrl: 'http://url' } });

      const result = await listingService.createListing(inputData);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO listings'), expect.anything());
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO listing_images'), expect.anything());
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(auditService.logAudit).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    /*
    [Description]: Kiểm tra xem service có validate các trường bắt buộc và ném lỗi trước khi gọi DB hay không.
    [Pre-condition]: N/A
    [Data Test]: inputData = { title: '' } (Thiếu hoặc sai dữ liệu bắt buộc)
    [Steps]: 
      1. Gọi hàm listingService.createListing với dữ liệu lỗi.
    [Expected Result]: Ném ra lỗi 'Title is required'.
    */
    it('should validate required fields before db call', async () => {
      const inputData: any = { title: '' }; 
      await expect(listingService.createListing(inputData)).rejects.toThrow('Title is required');
    });
  });

  // 3. getListingById
  describe('getListingById', () => {
    /*
    [Description]: Kiểm tra xem service có trả về chi tiết bài đăng khi tìm thấy ID hay không.
    [Pre-condition]: Database query tìm thấy bản ghi.
    [Data Test]: id='1'
    [Steps]: 
      1. Mock pool.query trả về 1 row.
      2. Gọi hàm listingService.getListingById('1').
    [Expected Result]: Trả về object listing đúng ID và Title.
    */
    it('should return listing detail', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', title: 'Detail' }] });
      const res = await listingService.getListingById('1');
      expect(res).toEqual({ id: '1', title: 'Detail' });
    });
  });

  // 4. getUserListings
  describe('getUserListings', () => {
    /*
    [Description]: Kiểm tra xem service có trả về danh sách bài đăng của một người dùng cụ thể kèm theo bộ lọc trạng thái hay không.
    [Pre-condition]: Database query trả về dữ liệu.
    [Data Test]: userId='user-1', page=1, limit=10, status='pending'
    [Steps]: 
      1. Mock pool.query trả về listings.
      2. Gọi hàm listingService.getUserListings.
    [Expected Result]: 
      - Trả về object { items, total }.
      - Query SQL chứa điều kiện lọc theo seller_id và status.
    */
    it('should return user listings with filters', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [{ id: '1', title: 'My Car', total_count: '1' }] 
      });

      const result = await listingService.getUserListings('user-1', 1, 10, 'pending');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('l.seller_id = $1'), 
        expect.arrayContaining(['user-1', 'pending'])
      );
    });
  });

  // 5. updateListing (Complex Logic - Đã fix lỗi string matching)
  describe('updateListing', () => {
    /*
    [Description]: Kiểm tra quy trình cập nhật bài đăng: cập nhật các trường, thêm/xóa ảnh mới/cũ, tất cả trong transaction.
    [Pre-condition]: DB và Supabase hoạt động tốt.
    [Data Test]: id='1', updates={...}, newImages=[...], deleteImageIds=['img-old-1'], userId='user-1'
    [Steps]: 
      1. Mock Transaction (BEGIN, UPDATE, DELETE, INSERT, COMMIT).
      2. Mock Supabase upload.
      3. Gọi hàm listingService.updateListing.
    [Expected Result]: 
      - Transaction thực hiện đầy đủ các bước.
      - UPDATE listings được gọi.
      - DELETE và INSERT listing_images được gọi.
    */
    it('should update fields and handle images transactionally', async () => {
      // Setup mock trả về
      mockClient.query.mockResolvedValue({ rows: [{ id: '1', title: 'Updated Title' }] }); 

      // Mock upload ảnh thành công
      (supabase.storage.from('bucket').upload as jest.Mock).mockResolvedValue({ error: null });
      (supabase.storage.from('bucket').getPublicUrl as jest.Mock).mockReturnValue({ data: { publicUrl: 'http://new-img' } });

      const updates = { title: 'Updated Title', price_vnd: 999 };
      const newImages = [{ originalname: 'new.jpg', buffer: Buffer.from('img'), mimetype: 'image/jpeg' }] as any;
      const deleteImageIds = ['img-old-1'];

      await listingService.updateListing('1', updates, newImages, deleteImageIds, 'user-1');

      // 1. Kiểm tra transaction
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      
      // 2. Kiểm tra UPDATE
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE listings[\s\S]*SET/),
        expect.arrayContaining(['Updated Title', 999, '1'])
      );

      // 3. Kiểm tra xóa ảnh cũ
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM listing_images'),
        expect.arrayContaining([deleteImageIds, '1'])
      );

      // 4. Kiểm tra thêm ảnh mới
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO listing_images'),
        expect.anything()
      );

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    /*
    [Description]: Kiểm tra xem transaction có được ROLLBACK nếu cập nhật thất bại hay không.
    [Pre-condition]: DB gặp lỗi khi update.
    [Data Test]: id='1', updates={ title: 'Fail' }
    [Steps]: 
      1. Mock client.query ném ra lỗi (Rejected).
      2. Gọi hàm listingService.updateListing.
    [Expected Result]: 
      - Ném ra lỗi 'Update Failed'.
      - Transaction thực hiện ROLLBACK.
    */
    it('should rollback if update fails', async () => {
      mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mockClient.query.mockRejectedValueOnce(new Error('Update Failed')); 

      await expect(listingService.updateListing('1', { title: 'Fail' }, [], [], 'user-1'))
        .rejects.toThrow('Update Failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  // 6. updateListingStatus
  describe('updateListingStatus', () => {
    /*
    [Description]: Kiểm tra xem service có cập nhật trạng thái bài đăng và ghi log audit hay không.
    [Pre-condition]: DB update thành công.
    [Data Test]: id='1', status='approved', userId='admin-1'
    [Steps]: 
      1. Mock pool.query trả về thành công.
      2. Gọi hàm listingService.updateListingStatus.
    [Expected Result]: 
      - Query UPDATE status được thực thi.
      - Audit log được ghi.
    */
    it('should update status and log audit', async () => {
      (pool.query as jest.Mock).mockResolvedValue({});
      
      await listingService.updateListingStatus('1', 'approved' as any, 'admin-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE listings SET status'),
        expect.arrayContaining(['approved', 'admin-1', '1'])
      );
      expect(auditService.logAudit).toHaveBeenCalled();
    });
  });

  // 7. deleteListing
  describe('deleteListing', () => {
    /*
    [Description]: Kiểm tra xem service có thực hiện xóa bài đăng dựa trên ID hay không.
    [Pre-condition]: DB delete thành công.
    [Data Test]: id='1'
    [Steps]: 
      1. Mock pool.query thực thi DELETE.
      2. Gọi hàm listingService.deleteListing.
    [Expected Result]: Query DELETE listings được thực thi.
    */
    it('should delete listing', async () => {
      (pool.query as jest.Mock).mockResolvedValue({});
      
      await listingService.deleteListing('1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM listings'),
        ['1']
      );
    });
  });

  // 8. Interactions
  describe('Interactions', () => {
    /*
    [Description]: Kiểm tra xem service có thêm bài đăng vào danh sách yêu thích (favorites) hay không.
    [Pre-condition]: DB insert thành công.
    [Data Test]: userId='user-1', listingId='list-1'
    [Steps]: 
      1. Gọi hàm listingService.addFavorite.
    [Expected Result]: Query INSERT INTO favorites được thực thi.
    */
    it('should add favorite', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'fav-1' }] });
      await listingService.addFavorite('user-1', 'list-1');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO favorites'), expect.any(Array));
    });

    /*
    [Description]: Kiểm tra xem service có thêm bài đăng vào danh sách so sánh (comparison) hay không.
    [Pre-condition]: DB insert thành công.
    [Data Test]: userId='user-1', listingId1='list-1', listingId2='list-2'
    [Steps]: 
      1. Gọi hàm listingService.addComparison.
    [Expected Result]: Query INSERT INTO comparisons được thực thi.
    */
    it('should add comparison', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'comp-1' }] });
      await listingService.addComparison('user-1', 'list-1', 'list-2');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO comparisons'), expect.any(Array));
    });

    /*
    [Description]: Kiểm tra xem service có tạo báo cáo vi phạm (report violation) hay không.
    [Pre-condition]: DB insert thành công.
    [Data Test]: listingId='list-1', userId='user-1', reason='spam', note='note'
    [Steps]: 
      1. Gọi hàm listingService.reportViolation.
    [Expected Result]: Query INSERT INTO reports được thực thi.
    */
    it('should report violation', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'rep-1' }] });
      await listingService.reportViolation('list-1', 'user-1', 'spam', 'note');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO reports'), expect.any(Array));
    });
  });

  // 9. Auxiliary Data
  describe('Auxiliary Data', () => {
    /*
    [Description]: Kiểm tra xem service có lấy danh sách thương hiệu (brands) hay không.
    [Pre-condition]: DB trả về danh sách brands.
    [Data Test]: Không có
    [Steps]: 
      1. Mock pool.query trả về mockRows.
      2. Gọi hàm listingService.listBrands.
    [Expected Result]: Trả về mảng chứa brand.
    */
    it('should list brands', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'Toyota' }] });
      const res = await listingService.listBrands();
      expect(res).toHaveLength(1);
    });

    /*
    [Description]: Kiểm tra xem service có lấy danh sách tỉnh thành (provinces) hay không.
    [Pre-condition]: DB trả về danh sách provinces.
    [Data Test]: Không có
    [Steps]: 
      1. Mock pool.query trả về mockRows.
      2. Gọi hàm listingService.listProvinces.
    [Expected Result]: Trả về mảng chứa province.
    */
    it('should list provinces', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'HCM' }] });
      const res = await listingService.listProvinces();
      expect(res).toHaveLength(1);
    });

    /*
    [Description]: Kiểm tra xem service có lấy danh sách dòng xe (models) theo thương hiệu (brand) hay không.
    [Pre-condition]: DB trả về danh sách models.
    [Data Test]: brandId=1
    [Steps]: 
      1. Mock pool.query trả về mockRows.
      2. Gọi hàm listingService.listModelsByBrand(1).
    [Expected Result]: Query thực thi với tham số brandId=1.
    */
    it('should list models by brand', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'Vios' }] });
      const res = await listingService.listModelsByBrand(1);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  // 10. getAllListingsAdmin
  describe('getAllListingsAdmin', () => {
      /*
      [Description]: Kiểm tra xem service có trả về danh sách tất cả bài đăng dành cho Admin hay không.
      [Pre-condition]: DB trả về danh sách.
      [Data Test]: Không có
      [Steps]: 
        1. Mock pool.query trả về mockRows.
        2. Gọi hàm listingService.getAllListingsAdmin.
      [Expected Result]: Trả về mảng listings.
      */
     it('should return admin listings list', async () => {
       (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });
       const res = await listingService.getAllListingsAdmin();
       expect(res).toHaveLength(1);
     });
  });
});