// src/routes/reportRoutes.ts
import { Router } from 'express';
import { authenticateTokenOptional } from '../middleware/auth'; 
import * as reportController from '../controllers/reportController';
import { authenticateToken, requireAdmin } from '../middleware/auth'; // Thêm requireAdmin cho admin only

const router = Router();

// POST /api/reports (optional auth: anonymous OK với phone, logged in dùng reporter_id)
router.post('/', authenticateTokenOptional, reportController.createReport);
// GET reports theo listing_id (admin only)
router.get('/', authenticateToken, requireAdmin, reportController.getReportsForListing);
// PATCH status report (admin only)
router.patch('/:reportId/status', authenticateToken, requireAdmin, reportController.updateReportStatusController);
export default router;