// src/controllers/listingController.ts
import { Request, Response } from 'express';
import * as listingService from '../services/listingService';
import { ListingStatus } from '../models/listing';

const toPositiveInt = (v: unknown, def: number, max?: number) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return def;
  const i = Math.floor(n);
  return max ? Math.min(i, max) : i;
};

export const getAllListings = async (req: Request, res: Response) => {
  try {
    // Đọc & chuẩn hóa query
    const status = (req.query.status as string | undefined)?.trim() || "approved";
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 12, 60); // giới hạn tối đa 60

    const filters = {
      min_price: req.query.min_price != null ? Number(req.query.min_price) : undefined,
      max_price: req.query.max_price != null ? Number(req.query.max_price) : undefined,
      body_type: (req.query.body_type as string | undefined)?.trim(),
    };

    // Validate nhanh min/max
    if (
      (filters.min_price != null && !Number.isFinite(filters.min_price)) ||
      (filters.max_price != null && !Number.isFinite(filters.max_price))
    ) {
      return res.status(400).json({ error: "min_price/max_price phải là số" });
    }

    const { items, total } = await listingService.getAllListings(status, page, limit, filters);

    const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

    return res.json({
      data: items,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error("getAllListings error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getListing = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const listing = await listingService.getListingById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json({ data: listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user?.id;
    
    if (!sellerId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    // Debug log
    console.log("📨 Received create listing request from user:", sellerId);
    console.log("📦 Request body:", req.body);
    console.log("📸 Files:", req.files);

    // Validation
    if (!req.body.title || req.body.title.trim() === "") {
      return res.status(400).json({ error: "Tiêu đề (title) là bắt buộc" });
    }
    if (!req.body.price_vnd || Number(req.body.price_vnd) <= 0) {
      return res.status(400).json({ error: "Giá bán (price_vnd) phải lớn hơn 0" });
    }
    if (!req.body.brand_id || !req.body.model_id) {
      return res.status(400).json({ error: "Hãng xe (brand_id) và dòng xe (model_id) là bắt buộc" });
    }

    const newListing = await listingService.createListing({
      seller_id: sellerId,
      title: req.body.title,
      price_vnd: Number(req.body.price_vnd),
      brand_id: Number(req.body.brand_id),
      model_id: Number(req.body.model_id),
      year: Number(req.body.year),
      mileage_km: req.body.mileage_km ? Number(req.body.mileage_km) : undefined,
      gearbox: req.body.gearbox || null,
      fuel: req.body.fuel || null,
      body_type: req.body.body_type || null,
      seats: req.body.seats ? Number(req.body.seats) : undefined,
      origin: req.body.origin || null,
      description: req.body.description || null,
      province_id: req.body.province_id ? Number(req.body.province_id) : undefined,
      district_id: req.body.district_id ? Number(req.body.district_id) : undefined,
      address_line: req.body.address_line || null,
      color_ext: req.body.color_ext || null,
      color_int: req.body.color_int || null,
      video_url: req.body.video_url || null,
      images: req.files as Express.Multer.File[],
    });

    console.log("✅ Listing created successfully:", newListing.id);

    res.status(201).json({
      message: "Listing created successfully",
      id: newListing.id,
    });
  } catch (err) {
    console.error("❌ createListing controller error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateListingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Từ body: 'approved' hoặc 'rejected'
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status phải là 'approved' hoặc 'rejected'" });
    }
    const approver_id = (req.user as any).id; // Từ JWT
    if (!approver_id) return res.status(401).json({ error: "Unauthorized" });
    const result = await listingService.updateListingStatus(id, status, approver_id);
    res.json({ data: result, message: `Status updated to ${status}` });
  } catch (err: any) {
    console.error("Update status error:", err);
    res.status(err.status || 404).json({ error: err.message || "Listing not found" });
  }
};

export const getUserListings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Đồng bộ cách đọc query với getAllListings
    // (giữ nguyên limit mặc định bạn thích; có thể 9 để khớp UI, hoặc 12 như public)
    const page  = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 9, 60);

    // (tuỳ chọn) status của bài đăng cá nhân: "all" | "draft" | "pending" | "approved" | "rejected"
    const status = ((req.query.status as string | undefined)?.trim() || "all").toLowerCase();

    // Gọi service tương ứng
    const { items, total } = await listingService.getUserListings(userId, page, limit, status);

    const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

    return res.json({
      data: items,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error("getUserListings error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { listingId } = req.body;
    const favorite = await listingService.addFavorite(userId, listingId);
    res.status(201).json({ data: favorite });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const addComparison = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { left_listing_id, right_listing_id } = req.body;
    const comparison = await listingService.addComparison(userId, left_listing_id, right_listing_id);
    res.status(201).json({ data: comparison });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const reportViolation = async (req: Request, res: Response) => {
  try {
    const { listingId, type, note } = req.body;
    const reporterId = (req.user as any).id;
    const report = await listingService.reportViolation(listingId, reporterId, type, note);
    res.status(201).json({ data: report });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await listingService.deleteListing(id);
    res.json({ data: result });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
};

export const editListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const updates = req.body;
    const listing = await listingService.updateListing(id, updates, userId);
    res.json({ data: listing });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getProvinces = async (req: Request, res: Response) => {
  const data = await listingService.listProvinces();
  res.json({ data });
};

export const getDistrictsByProvince = async (req: Request, res: Response) => {
  const provinceId = Number(req.query.province_id);
  if (!provinceId) return res.status(400).json({ message: "province_id is required" });
  const data = await listingService.listDistrictsByProvince(provinceId);
  res.json({ data });
};

export const getBrands = async (req: Request, res: Response) => {
  const data = await listingService.listBrands();
  res.json({ data });
};

export const getModelsByBrand = async (req: Request, res: Response) => {
  try {
    const brandId = Number(req.query.brand_id);
    if (!brandId) return res.status(400).json({ message: "brand_id is required" });
    const data = await listingService.listModelsByBrand(brandId);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};