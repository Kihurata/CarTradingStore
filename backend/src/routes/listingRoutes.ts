import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as listingController from '../controllers/listingController';

const router = Router();

// GET /api/listings
router.get('/', authenticateToken, listingController.getAllListings);

// GET /api/listings/:id
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);
router.get('/user/:userId', listingController.getUserListings);
router.get('/:id', authenticateToken, listingController.getListing);

// POST /api/listings
router.post('/', authenticateToken, listingController.createListing);

// PUT /api/listings/:id (edit)
router.put('/:id', authenticateToken, listingController.editListing);  
// PATCH /api/listings/:id/status (approve)
router.patch('/:id/status', authenticateToken, requireAdmin, listingController.approveListing);

// DELETE /api/listings/:id
router.delete('/:id', authenticateToken, requireAdmin, listingController.deleteListing);

// GET /api/listings/user
router.get('/user', authenticateToken, listingController.getUserListings);

// POST /api/listings/favorite
router.post('/favorite', authenticateToken, listingController.addFavorite);

// POST /api/listings/comparison
router.post('/comparison', authenticateToken, listingController.addComparison);

// POST /api/listings/report
router.post('/report', authenticateToken, listingController.reportViolation);


router.post('/:id/favorite', authenticateToken, listingController.addFavorite);
router.post('/:id/comparison', authenticateToken, listingController.addComparison);
router.post('/:id/report', authenticateToken, listingController.reportViolation);
export default router;