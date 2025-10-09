import { Request, Response } from 'express';
import * as listingService from '../services/listingService';
import { ListingStatus } from '../models/listing';

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);

    const { items, total } = await listingService.getAllListings(
      status as string | undefined,
      p,
      l
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
    const { id } = req.params;
    const listing = await listingService.getListingById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ data: listing });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any).id;
    const listingData = req.body;
    const listing = await listingService.createListing(sellerId, listingData);
    res.status(201).json({ data: listing });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
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

