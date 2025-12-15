// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUser);
router.get('/me', authenticateToken, userController.getMe);
router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.patch('/:id/lock', authenticateToken, requireAdmin, userController.lockUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router;