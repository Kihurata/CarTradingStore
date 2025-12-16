// backend/src/routes/adminRoutes.ts
import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  getListings,
  updateListingStatusHandler,
  updateListingHandler,
  getReports,
  getUsers,
  updateUserStatusHandler,
  getAdminStats,
  printStats,
} from "../controllers/adminController";

const router = Router();

// ✅ Áp dụng cho toàn bộ admin routes
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
