import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import * as listingController from "../controllers/listingController";

const router = Router();

// Danh sách bài đăng
router.get("/", listingController.getAllListings);

// Chi tiết 1 bài đăng
router.get("/:id", listingController.getListing);

// Bài đăng theo user
router.get("/user/:userId", authenticateToken, listingController.getUserListings);

// Tạo mới
router.post("/", authenticateToken, listingController.createListing);

// Sửa
router.put("/:id", authenticateToken, listingController.editListing);

// Duyệt bài (admin)
router.patch("/:id/status", authenticateToken, requireAdmin, listingController.approveListing);

// Xoá bài (admin)
router.delete("/:id", authenticateToken, requireAdmin, listingController.deleteListing);

// Hành động khác
router.post("/:id/favorite", authenticateToken, listingController.addFavorite);
router.post("/:id/comparison", authenticateToken, listingController.addComparison);
router.post("/:id/report", authenticateToken, listingController.reportViolation);

export default router;
