// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { authenticateToken,requireAdmin } from '../middleware/auth';
import { getDashboard, getListings, updateListingStatusHandler, updateListingHandler, getReports, getUsers, updateUserStatusHandler, getAdminStats, printStats } from '../controllers/adminController';

const router = Router();

// Dashboard (UC1.0)
router.get('/dashboard', authenticateToken, requireAdmin, getDashboard);
// Quản lý bài đăng (UC1.1-1.4)
router.get('/listings', requireAdmin, getListings);
router.patch('/listings/:id/status', requireAdmin, updateListingStatusHandler);
router.patch('/listings/:id', requireAdmin, updateListingHandler);
router.get('/listings/:id/reports', requireAdmin, getReports);

router.use(authenticateToken, requireAdmin);

// Quản lý bài đăng
router.get("/listings", getListings);
router.patch("/listings/:id/status", updateListingStatusHandler);
router.patch("/listings/:id", updateListingHandler);
router.get("/listings/:id/reports", getReports);

// Quản lý người dùng
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatusHandler);

// Thống kê
router.get("/stats", getAdminStats);
router.get("/stats/print", printStats);

export default router;
