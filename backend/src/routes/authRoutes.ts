// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, forgotPassword, resetPassword } from '../controllers/authController';
// Assume login in userController

const router = Router();
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;