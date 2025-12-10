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

    it('should validate required fields before db call', async () => {
      const inputData: any = { title: '' }; 
      await expect(listingService.createListing(inputData)).rejects.toThrow('Title is required');
    });
  });

  // 3. getListingById
  describe('getListingById', () => {
    it('should return listing detail', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1', title: 'Detail' }] });
      const res = await listingService.getListingById('1');
      expect(res).toEqual({ id: '1', title: 'Detail' });
    });
  });

  // 4. getUserListings
  describe('getUserListings', () => {
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
      
      // 2. Kiểm tra UPDATE (Dùng Regex để chấp nhận xuống dòng \n)
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
    it('should add favorite', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'fav-1' }] });
      await listingService.addFavorite('user-1', 'list-1');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO favorites'), expect.any(Array));
    });

    it('should add comparison', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'comp-1' }] });
      await listingService.addComparison('user-1', 'list-1', 'list-2');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO comparisons'), expect.any(Array));
    });

    it('should report violation', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'rep-1' }] });
      await listingService.reportViolation('list-1', 'user-1', 'spam', 'note');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO reports'), expect.any(Array));
    });
  });

  // 9. Auxiliary Data
  describe('Auxiliary Data', () => {
    it('should list brands', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'Toyota' }] });
      const res = await listingService.listBrands();
      expect(res).toHaveLength(1);
    });

    it('should list provinces', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'HCM' }] });
      const res = await listingService.listProvinces();
      expect(res).toHaveLength(1);
    });

    it('should list models by brand', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name: 'Vios' }] });
      const res = await listingService.listModelsByBrand(1);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  // 10. getAllListingsAdmin
  describe('getAllListingsAdmin', () => {
     it('should return admin listings list', async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });
        const res = await listingService.getAllListingsAdmin();
        expect(res).toHaveLength(1);
     });
  });
});