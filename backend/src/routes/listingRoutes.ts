<<<<<<< Updated upstream
import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as listingController from '../controllers/listingController';

const router = Router();

// GET /api/listings
router.get('/', authenticateToken, listingController.getAllListings);
=======
import { Router } from "express";
import multer from "multer";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import * as listingController from "../controllers/listingController";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Cấu hình multer để xử lý upload file
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 2048 * 1024, // 2048KB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'));
    }
  }
});

// Danh sách bài đăng
router.get("/", listingController.getAllListings);
>>>>>>> Stashed changes

// GET /api/listings/:id
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);
router.get('/user/:userId', listingController.getUserListings);
router.get('/:id', authenticateToken, listingController.getListing);

// POST /api/listings
router.post('/', authenticateToken, listingController.createListing);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// PUT /api/listings/:id (edit)
router.put('/:id', authenticateToken, listingController.editListing);  
// PATCH /api/listings/:id/status (approve)
router.patch('/:id/status', authenticateToken, requireAdmin, listingController.approveListing);
=======
// Tạo mới - sử dụng middleware multer để xử lý ảnh
router.post("/", authenticateToken, upload.array('images', 25), listingController.createListing);
>>>>>>> Stashed changes
=======
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
>>>>>>> Stashed changes

// DELETE /api/listings/:id
router.delete('/:id', authenticateToken, requireAdmin, listingController.deleteListing);

// GET /api/listings/user
router.get('/user', authenticateToken, listingController.getUserListings);

// POST /api/listings/favorite
router.post('/favorite', authenticateToken, listingController.addFavorite);

// POST /api/listings/comparison
router.post('/comparison', authenticateToken, listingController.addComparison);

<<<<<<< Updated upstream
// POST /api/listings/report
router.post('/report', authenticateToken, listingController.reportViolation);


router.post('/:id/favorite', authenticateToken, listingController.addFavorite);
router.post('/:id/comparison', authenticateToken, listingController.addComparison);
router.post('/:id/report', authenticateToken, listingController.reportViolation);
export default router;
=======
// Địa điểm
router.get("/locations/provinces", listingController.getProvinces);
router.get("/locations/districts", listingController.getDistrictsByProvince);

export default router;
>>>>>>> Stashed changes
