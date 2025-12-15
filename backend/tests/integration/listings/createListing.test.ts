import request from 'supertest';
import app from '../../../src/app';
import jwt from 'jsonwebtoken';
import * as listingService from '../../../src/services/listingService';
import pool from '../../../src/config/database'; // ✅ Thêm import pool

// MOCK toàn bộ listingService 
jest.mock('../../../src/services/listingService', () => ({
  getAllListings: jest.fn(),
}));

// MOCK JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const mockVerify = jwt.verify as jest.Mock;
const mockGetAllListings = listingService.getAllListings as jest.Mock;

describe('Admin can see pending listings with full details', () => {
  // Listing pending đầy đủ thông tin 
  const PENDING_LISTING = {
    id: 'listing-789',
    seller_id: 'user-123',
    title: 'Bán xe Toyota Vios cũ',
    price_vnd: 350000000,
    brand_id: 1,
    model_id: 5,
    brand: 'Toyota',
    model: 'Vios',
    year: 2018,
    mileage_km: 85000,
    gearbox: 'Tự động',
    fuel: 'Xăng',
    body_type: 'Sedan',
    seats: 5,
    color_ext: '#FF0000',
    color_int: '#000000',
    origin: 'Lắp ráp trong nước',
    description: 'Xe gia đình đi kỹ, chính chủ, đầy đủ giấy tờ, không ngập nước, không tai nạn',
    province_id: 79,
    district_id: 760,
    address_line: '123 Đường ABC, Phường Tân Phú, Quận 7',
    location_text: 'Hồ Chí Minh - Quận 7',
    video_url: null,
    status: 'pending' as const,
    views_count: 0,
    edits_count: 0,
    reports_count: 0,
    created_at: '2025-04-05T10:00:00.000Z',
    updated_at: '2025-04-05T10:00:00.000Z',
    approved_at: null,
    approved_by: null,
    thumbnail_url: null,
    seller_name: 'Nguyễn Văn A',
    seller_phone: '0909123456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ QUAN TRỌNG: Đóng kết nối DB sau khi chạy xong để Jest không bị treo
  afterAll(async () => {
    await pool.end();
  });

  it('admin should see pending listing with full details without needing to approve', async () => {
    // Giả lập admin đăng nhập
    mockVerify.mockReturnValue({ id: 'admin-456', is_admin: true });

    // Mock service trả về danh sách có 1 listing pending đầy đủ thông tin
    mockGetAllListings.mockResolvedValue({
      items: [PENDING_LISTING],
      total: 1,
    });

    const response = await request(app)
      .get('/api/listings')
      .set('Cookie', ['jwt=mock_admin_token'])
      .query({
        status: 'pending',
        page: 1,
        limit: 10,
      });

    // Kiểm tra kết quả
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);

    // Kiểm tra đầy đủ thông tin listing
    expect(response.body.data[0]).toMatchObject({
      id: 'listing-789',
      title: 'Bán xe Toyota Vios cũ',
      price_vnd: 350000000,
      status: 'pending',
      brand: 'Toyota',
      model: 'Vios',
      year: 2018,
      mileage_km: 85000,
      gearbox: 'Tự động',
      fuel: 'Xăng',
      body_type: 'Sedan',
      seats: 5,
      description: expect.stringContaining('chính chủ'),
      location_text: 'Hồ Chí Minh - Quận 7',
      seller_name: 'Nguyễn Văn A',
      seller_phone: '0909123456',
    });

    expect(mockGetAllListings).toHaveBeenCalledWith(
      'pending',
      1,
      10,
      expect.objectContaining({
        sort: undefined,
      })
    );
  });
});