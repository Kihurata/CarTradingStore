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

export const createListing = async (req: Request, res: Response) => {
  try {
    const listingData = { ...req.body, seller_id: req.body.seller_id };  // Từ req.user nếu auth
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

export const deleteListing = async (req: Request, res: Response) => {
  try {
    await listingService.deleteListing(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};