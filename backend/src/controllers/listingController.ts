import { Request, Response } from 'express';
import * as listingService from '../services/listingService';
import { ListingStatus } from '../models/listing';

// Extend Request type để thêm user từ middleware auth
interface AuthRequest extends Request {
  user?: { id: string; is_admin: boolean };
}

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as ListingStatus;
    const listings = await listingService.getAllListings(status);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const getListing = async (req: Request, res: Response) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const listingData = { ...req.body, seller_id: userId };
    const listing = await listingService.createListing(listingData);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create listing' });
  }
};

export const approveListing = async (req: AuthRequest, res: Response) => {  
  try {
    const approver_id = req.user?.id;  
    const listing = await listingService.updateListingStatus(req.params.id, ListingStatus.APPROVED, approver_id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve listing' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await listingService.deleteListing(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

// UC5.1: Quản lý bài đăng của user
export const getUserListings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const listings = await listingService.getUserListings(userId);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
};

// UC5.2: Chỉnh sửa bài đăng
export const editListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const listingId = req.params.id;
    const updateData = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const listing = await listingService.updateListing(listingId, updateData, userId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: 'Failed to edit listing' });
  }
};

// UC4.2 A1: Thêm yêu thích
export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const listingId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await listingService.addFavorite(userId, listingId);
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add favorite' });
  }
};

// UC4.2 A2: So sánh bài đăng
export const addComparison = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { left_listing_id, right_listing_id } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const comparison = await listingService.addComparison(userId, left_listing_id, right_listing_id);
    res.status(201).json(comparison);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add comparison' });
  }
};

// UC4.3: Báo cáo vi phạm
export const reportViolation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const listingId = req.params.id;
    const { type, note } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const report = await listingService.reportViolation(listingId, userId, type, note);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to report violation' });
  }
};