import request from 'supertest';
import express from 'express';
import * as listingController from '../../../src/controllers/listingController';

// 1. Giả lập Middleware trước khi import Routes
jest.mock('../../../src/middleware/auth', () => ({
  // Bỏ qua xác thực token
  authenticateToken: (req: any, res: any, next: any) => next(), 
  // Bỏ qua yêu cầu quyền Admin
  requireAdmin: (req: any, res: any, next: any) => next(),
}));

// 2. Giả lập Multer để bypass xử lý upload file
jest.mock('multer', () => {
  const multer = () => ({
    // Giả lập hàm array() để bỏ qua việc xử lý mảng file
    array: () => (req: any, res: any, next: any) => next(), 
    // Giả lập hàm single()
    single: () => (req: any, res: any, next: any) => next(),
  });
  multer.memoryStorage = () => jest.fn();
  return multer;
});

// 3. Giả lập Controller
jest.mock('../../../src/controllers/listingController');

// Import routes SAU KHI đã mock
import listingRoutes from '../../../src/routes/listingRoutes';

const app = express();
app.use(express.json());
app.use('/api/listings', listingRoutes);

describe('Unit Test: Listing Routes', () => {
  afterEach(() => jest.clearAllMocks());

  /*
  [Description]: Kiểm tra route GET / (lấy tất cả bài đăng) có gọi đúng controller getAllListings hay không.
  [Pre-condition]: Middleware Auth được mock để cho phép request đi qua.
  [Data Test]: Method: GET, Path: '/api/listings'
  [Steps]: 
    1. Mock listingController.getAllListings trả về status 200.
    2. Gửi request GET đến '/api/listings'.
  [Expected Result]: Controller listingController.getAllListings được gọi chính xác.
  */
  it('GET / should call listingController.getAllListings', async () => {
    (listingController.getAllListings as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/listings');
    expect(listingController.getAllListings).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route POST / (Tạo bài đăng) có đi qua các middleware (Auth, Multer) và gọi đúng controller createListing hay không.
  [Pre-condition]: Middleware Auth và Multer đã được mock để bypass (luôn gọi next).
  [Data Test]: Method: POST, Path: '/api/listings', Body: { title: 'New Car' }
  [Steps]: 
    1. Mock listingController.createListing trả về status 201.
    2. Gửi request POST đến '/api/listings' kèm body.
  [Expected Result]: 
    - Request đi qua được các middleware.
    - Controller listingController.createListing được gọi chính xác.
  */
  it('POST / (Create) should pass middlewares and call listingController.createListing', async () => {
    (listingController.createListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(201));
    
    await request(app).post('/api/listings').send({ title: 'New Car' });
    
    // Kiểm tra xem controller có được gọi không (nghĩa là đã qua được Auth và Multer mock)
    expect(listingController.createListing).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route POST /:id/approve (Cập nhật trạng thái) có gọi đúng controller updateListingStatus hay không.
  [Pre-condition]: Middleware Auth/Admin được mock để cho phép.
  [Data Test]: Method: POST, Path: '/api/listings/1/approve'
  [Steps]: 
    1. Mock listingController.updateListingStatus trả về status 200.
    2. Gửi request POST đến '/api/listings/1/approve'.
  [Expected Result]: Controller listingController.updateListingStatus được gọi chính xác.
  */
  it('POST /:id/approve should call listingController.updateListingStatus', async () => {
    (listingController.updateListingStatus as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).post('/api/listings/1/approve');
    
    expect(listingController.updateListingStatus).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route DELETE /:id (Xóa bài đăng) có gọi đúng controller deleteListing hay không.
  [Pre-condition]: Middleware Auth được mock để cho phép.
  [Data Test]: Method: DELETE, Path: '/api/listings/1'
  [Steps]: 
    1. Mock listingController.deleteListing trả về status 200.
    2. Gửi request DELETE đến '/api/listings/1'.
  [Expected Result]: Controller listingController.deleteListing được gọi chính xác.
  */
  it('DELETE /:id should call listingController.deleteListing', async () => {
    (listingController.deleteListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).delete('/api/listings/1');
    
    expect(listingController.deleteListing).toHaveBeenCalled();
  });
});