// src/routes/reportRoutes.ts
import { Router } from 'express';
import { authenticateTokenOptional } from '../middleware/auth'; 
import * as reportController from '../controllers/reportController';

const router = Router();

// POST /api/reports (optional auth: anonymous OK với phone, logged in dùng reporter_id)
router.post('/', authenticateTokenOptional, reportController.createReport);

export default router;