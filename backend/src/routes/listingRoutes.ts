import { Router } from 'express';
import * as listingController from '../controllers/listingController'; 
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);

// Protected
router.post('/', authenticateToken, listingController.createListing);
router.patch('/:id/approve', authenticateToken, requireAdmin, listingController.approveListing);
router.delete('/:id', authenticateToken, requireAdmin, listingController.deleteListing);

export default router;