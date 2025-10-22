//scr/routes/listingRoutes.ts
import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import * as listingController from "../controllers/listingController";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Danh sách bài đăng
router.get("/", listingController.getAllListings);

// Chi tiết 1 bài đăng
router.get("/:id", listingController.getListing);

// Bài đăng theo user
router.get("/user/:userId", authenticateToken, listingController.getUserListings);

// 🧩 Tạo mới listing (chấp nhận cả JSON hoặc multipart)
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
      // Nếu là form có ảnh
      upload.array("images")(req, res, next);
    } else {
      // Nếu là JSON
      next();
    }
  },
  listingController.createListing
);

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

// Địa điểm
router.get("/locations/provinces", listingController.getProvinces);
router.get("/locations/districts", listingController.getDistrictsByProvince);


// Brands & Models
router.get("/brands", listingController.getBrands);
router.get("/models", listingController.getModelsByBrand);
export default router;
