// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, forgotPassword, resetPassword, login, logout } from '../controllers/authController';

const router = Router();
router.post('/register', register);
router.post('/login', login);  // Thêm
router.post('/logout', logout);  // Thêm
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;  