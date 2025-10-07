import { Router } from 'express';
import * as userController from '../controllers/userController';  
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/:id', userController.getUser);

// Protected
router.post('/', userController.createUser);
router.patch('/:id/lock', authenticateToken, requireAdmin, userController.lockUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router;