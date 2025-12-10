import request from 'supertest';
import express from 'express';
import * as listingController from '../../../src/controllers/listingController';

// 1. Mock Middleware trước khi import Routes
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => next(),
  requireAdmin: (req: any, res: any, next: any) => next(),
}));

// 2. Mock Multer (quan trọng để bypass upload file)
jest.mock('multer', () => {
  const multer = () => ({
    array: () => (req: any, res: any, next: any) => next(), // Bypass upload.array
    single: () => (req: any, res: any, next: any) => next(),
  });
  multer.memoryStorage = () => jest.fn();
  return multer;
});

// 3. Mock Controller
jest.mock('../../../src/controllers/listingController');

// Import routes SAU KHI đã mock
import listingRoutes from '../../../src/routes/listingRoutes';

const app = express();
app.use(express.json());
app.use('/api/listings', listingRoutes);

describe('Unit Test: Listing Routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('GET / should call listingController.getAllListings', async () => {
    (listingController.getAllListings as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    await request(app).get('/api/listings');
    expect(listingController.getAllListings).toHaveBeenCalled();
  });

  it('POST / (Create) should pass middlewares and call listingController.createListing', async () => {
    (listingController.createListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(201));
    
    await request(app).post('/api/listings').send({ title: 'New Car' });
    
    // Kiểm tra xem controller có được gọi không (nghĩa là đã qua được Auth và Multer mock)
    expect(listingController.createListing).toHaveBeenCalled();
  });

  it('POST /:id/approve should call listingController.updateListingStatus', async () => {
    (listingController.updateListingStatus as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).post('/api/listings/1/approve');
    
    expect(listingController.updateListingStatus).toHaveBeenCalled();
  });

  it('DELETE /:id should call listingController.deleteListing', async () => {
    (listingController.deleteListing as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));
    
    await request(app).delete('/api/listings/1');
    
    expect(listingController.deleteListing).toHaveBeenCalled();
  });
});