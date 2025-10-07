import { Router } from 'express';
import * as listingController from '../controllers/listingController'; 
import { authenticateToken, requireAdmin } from '../middleware/auth';
import multer from 'multer'; 

const upload = multer({ dest: 'uploads/' }); 
const router = Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);

// Protected
router.post('/', authenticateToken, upload.array('images', 5), listingController.createListing);  
router.patch('/:id/approve', authenticateToken, requireAdmin, listingController.approveListing);
router.delete('/:id', authenticateToken, requireAdmin, listingController.deleteListing);

// UC4.2 A1: Thêm yêu thích
router.post('/:id/favorite', authenticateToken, listingController.addFavorite);

// UC4.2 A2: So sánh
router.post('/comparisons', authenticateToken, listingController.addComparison);

// UC4.3: Báo cáo
router.post('/:id/report', authenticateToken, listingController.reportViolation);

// UC5.1: Quản lý bài đăng của user
router.get('/mine', authenticateToken, listingController.getUserListings);

// UC5.2: Chỉnh sửa bài đăng
router.put('/:id', authenticateToken, listingController.editListing);

export default router;