// src/controllers/listingController.ts
import { Request, Response } from 'express';
import * as listingService from '../services/listingService';
import { ListingStatus } from '../models/listing';

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const { status, page = "1", limit = "10", min_price, max_price, body_type } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);

    const filters = {
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      body_type: (body_type as string) || undefined,
    };

    const { items, total } = await listingService.getAllListings(
      status as string | undefined,
      p,
      l,
      filters
    );

    res.json({
      data: items,
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
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
    const sellerId = (req as any).user?.id || req.body.seller_id;

    // ✅ Sửa: Map từ English keys của FormData (frontend append "title", "brand", etc.)
    // Thêm validation cho các trường bắt buộc (title, price_vnd, etc.)
    const body = req.body;
    if (!body.title || body.title.trim() === "") {
      return res.status(400).json({ error: "Tiêu đề (title) là bắt buộc" });
    }
    if (!body.price_vnd || Number(body.price_vnd) <= 0) {
      return res.status(400).json({ error: "Giá bán (price_vnd) phải lớn hơn 0" });
    }

    const newListing = await listingService.createListing({
      seller_id: sellerId,
      title: body.title,
      price_vnd: Number(body.price_vnd),
      brand: body.brand || null,
      model: body.model || null,
      year: body.year ? parseInt(body.year as string, 10) : undefined,
      gearbox: body.gearbox || null,
      fuel: body.fuel || null,
      body_type: body.body_type || null,
      seats: body.seats ? Number(body.seats) : undefined,
      origin: body.origin || null,
      description: body.description || null,
      province_id: body.province_id ? Number(body.province_id) : undefined,
      district_id: body.district_id ? Number(body.district_id) : undefined,
      address_line: body.address_line || null,
      images: req.files as Express.Multer.File[],
    });

    res.status(201).json({
      message: "Listing created successfully",
      id: newListing.id,
    });
  } catch (err) {
    console.error("❌ createListing controller error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const approveListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const approver_id = (req.user as any).id;
    const listing = await listingService.updateListingStatus(id, ListingStatus.APPROVED, approver_id);
    res.json({ data: listing });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
};

export const getUserListings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { page = '1', limit = '10' } = req.query;
    const listings = await listingService.getUserListings(userId, parseInt(page as string), parseInt(limit as string));
    res.json({ data: listings });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
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