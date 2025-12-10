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
    it('should fetch listings and return meta data', async () => {
      (listingService.getAllListings as jest.Mock).mockResolvedValue({ items: [], total: 0 });
      
      await listingController.getAllListings(req as Request, res as Response);

      expect(listingService.getAllListings).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ meta: expect.any(Object) }));
    });
  });

  describe('createListing', () => {
    it('should return 401 if no user', async () => {
      req.user = undefined;
      await listingController.createListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(401);
    });

    it('should return 400 validation error', async () => {
      req.body = { title: '' };
      await listingController.createListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it('should create listing successfully', async () => {
      req.body = { title: 'Car', price_vnd: '100', brand_id: '1', model_id: '1', year: '2020' };
      (listingService.createListing as jest.Mock).mockResolvedValue({ id: 'new-id' });

      await listingController.createListing(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-id' }));
    });
  });

  describe('updateListingStatus', () => {
    it('should return 400 for invalid status', async () => {
      req.body = { status: 'invalid' };
      await listingController.updateListingStatus(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

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
    it('should return listing detail', async () => {
      req.params = { id: '1' };
      (listingService.getListingById as jest.Mock).mockResolvedValue({ id: '1' });
      
      await listingController.getListing(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: { id: '1' } });
    });

    it('should return 404 if not found', async () => {
      (listingService.getListingById as jest.Mock).mockResolvedValue(null);
      await listingController.getListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });
  });

  // Test Filter Logic trong getAllListings [cite: 82-94]
  describe('getAllListings Filters', () => {
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

    it('should return 400 for invalid price', async () => {
      req.query = { min_price: 'invalid' };
      await listingController.getAllListings(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  // Test deleteListing [cite: 131]
  describe('deleteListing', () => {
    it('should delete listing successfully', async () => {
      req.params = { id: '1' };
      (listingService.deleteListing as jest.Mock).mockResolvedValue({ success: true });
      
      await listingController.deleteListing(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: { success: true } });
    });

    it('should handle errors', async () => {
      (listingService.deleteListing as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await listingController.deleteListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404); // Controller catch trả 404 theo code mẫu
    });
  });

  // Test editListing [cite: 133]
  describe('editListing', () => {
    it('should return 401 if unauthorized', async () => {
      req.user = undefined;
      await listingController.editListing(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(401);
    });

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

  // Test Auxiliary Functions (Provinces, Brands...) [cite: 145-151]
  describe('Auxiliary Data', () => {
    it('should get models by brand', async () => {
      req.query = { brand_id: '1' };
      (listingService.listModelsByBrand as jest.Mock).mockResolvedValue([]);
      
      await listingController.getModelsByBrand(req as Request, res as Response);
      expect(json).toHaveBeenCalledWith({ data: [] });
    });

    it('should return 400 if brand_id missing', async () => {
      req.query = {};
      await listingController.getModelsByBrand(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });
});