// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { authenticateToken,requireAdmin } from '../middleware/auth';
import { getListings, updateListingStatusHandler, updateListingHandler, getReports, getUsers, updateUserStatusHandler, getAdminStats, printStats } from '../controllers/adminController';

const router = Router();

// Quản lý bài đăng (UC1.1-1.4)
router.get('/listings', requireAdmin, getListings);
router.patch('/listings/:id/status', requireAdmin, updateListingStatusHandler);
router.patch('/listings/:id', requireAdmin, updateListingHandler);
router.get('/listings/:id/reports', requireAdmin, getReports);

// Quản lý người dùng (UC3)
router.get('/users',authenticateToken, requireAdmin, getUsers);
router.patch('/users/:id/status', requireAdmin, updateUserStatusHandler);

// Thống kê (UC2.1-2.2)
router.get('/stats', requireAdmin, getAdminStats);
router.get('/stats/print', requireAdmin, printStats);

export default router;