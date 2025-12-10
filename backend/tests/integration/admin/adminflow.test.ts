import request from 'supertest';
import pool from '../../../src/config/database';

// Mock Auth Middleware: Bỏ qua xác thực và giả lập Admin User
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { 
      id: 'admin-456', 
      is_admin: true, 
      role: 'admin' 
    };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    next();
  },
  authenticateTokenOptional: (req: any, res: any, next: any) => {
    next();
  }
}));

// Mock Service: Giả lập các hàm xử lý logic của Listing
jest.mock('../../../src/services/listingService', () => ({
  getAllListings: jest.fn(),
  getListingById: jest.fn(),
  updateListing: jest.fn(),
  updateListingStatus: jest.fn(),
}));

import app from '../../../src/app';
import * as listingService from '../../../src/services/listingService';

const mockUpdateListing = listingService.updateListing as jest.Mock;
const mockUpdateListingStatus = listingService.updateListingStatus as jest.Mock;


describe('Full Admin Moderation Flow', () => {
  const LISTING_ID = 'listing-789';
  const ADMIN_ID = 'admin-456';
  
  const LISTING_DATA = {
    id: LISTING_ID,
    title: 'Bán xe Toyota Vios cũ',
    price_vnd: 350000000,
    status: 'pending',
    description: 'Xe còn mới',
    seller_id: 'user-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // --- START TEST FLOW ---

  it('Step 3: Admin updates listing price (Edit Action)', async () => {
    const UPDATED_PRICE = 340000000;
    
    // Mock service trả về data đã update
    mockUpdateListing.mockResolvedValue({ ...LISTING_DATA, price_vnd: UPDATED_PRICE });

    // Gọi API update
    const res = await request(app)
      .put(`/api/listings/${LISTING_ID}`)
      .send({ price_vnd: UPDATED_PRICE });

    expect(res.status).toBe(200);
    
    // Kiểm tra service được gọi với đúng ID và giá mới
    // Các tham số hình ảnh và user_id dùng expect.anything() để bỏ qua
    expect(mockUpdateListing).toHaveBeenCalledWith(
      LISTING_ID, 
      expect.objectContaining({ price_vnd: UPDATED_PRICE }),
      expect.anything(), 
      expect.anything(), 
      expect.anything()  
    );
  });

  it('Step 4: Admin approves the listing (Approve Action)', async () => {
    // Mock service trả về success
    mockUpdateListingStatus.mockResolvedValue({ success: true });

    // Gọi API approve
    const res = await request(app)
      .post(`/api/listings/${LISTING_ID}/approve`);

    expect(res.status).toBe(200);

    // Kiểm tra trạng thái chuyển sang 'approved'
    expect(mockUpdateListingStatus).toHaveBeenCalledWith(LISTING_ID, 'approved', ADMIN_ID);
  });

  it('Step 5: Admin rejects a listing (Reject Action)', async () => {
    // Mock service trả về success
    mockUpdateListingStatus.mockResolvedValue({ success: true });

    // Gọi API reject
    const res = await request(app)
      .post(`/api/listings/${LISTING_ID}/reject`);

    expect(res.status).toBe(200);
    
    // Kiểm tra trạng thái chuyển sang 'rejected'
    expect(mockUpdateListingStatus).toHaveBeenCalledWith(LISTING_ID, 'rejected', ADMIN_ID);
  });
});