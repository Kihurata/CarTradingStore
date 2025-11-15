//src/routes/listingRoutes.ts
import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import * as listingController from "../controllers/listingController";
import multer from "multer";
import { Request, Response, NextFunction } from 'express'; 

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Danh sách bài đăng
router.get("/", listingController.getAllListings);

// Địa điểm
router.get("/locations/provinces", listingController.getProvinces);
router.get("/locations/districts", listingController.getDistrictsByProvince);

// Brands & Models
router.get("/brands", listingController.getBrands);
router.get("/models", listingController.getModelsByBrand);

// Bài đăng của chính user (self)
router.get("/self", authenticateToken, listingController.getUserListings);

// Chi tiết 1 bài đăng
router.get("/:id", listingController.getListing);


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

// Duyệt bài (admin)
router.post("/:id/approve", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    req.body.status = 'approved'; 
    
    await listingController.updateListingStatus(req, res); 
  
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Từ chối bài (admin)
router.post("/:id/reject", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    req.body.status = 'rejected';
        await listingController.updateListingStatus(req, res);
  
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, upload.array("images"), listingController.editListing );
router.patch("/:id", authenticateToken, requireAdmin, upload.array("images"), listingController.editListing);

// Xoá bài (admin)
router.delete("/:id", authenticateToken, requireAdmin, listingController.deleteListing);

// Hành động khác
router.post("/:id/favorite", authenticateToken, listingController.addFavorite);
router.post("/:id/comparison", authenticateToken, listingController.addComparison);
router.post("/:id/report", authenticateToken, listingController.reportViolation);

// Giữ nguyên PATCH cũ nếu cần (cho tương lai)
router.patch("/:id/status", authenticateToken, requireAdmin, listingController.updateListingStatus);

export default router;