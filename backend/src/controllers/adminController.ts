import { Request, Response } from 'express';
import { getAdminListings, updateListingStatus, updateListing, getListingReports, getAdminUsers, updateUserStatus } from '../services/adminService';
import { getStats as getStatsService } from '../services/statsService';
import { generateStatsPDF } from '../utils/pdfGenerator';
import pool from '../config/database';

export const getListings = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const listings = await getAdminListings(status as string, parseInt(page as string), parseInt(limit as string));
    res.json({ data: listings, page: parseInt(page as string) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateListingStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const listing = await updateListingStatus(id, status as any, (req as any).user.id);
    res.json({ data: listing });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
};

export const updateListingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const listing = await updateListing(id, updates, (req as any).user.id);
    res.json({ data: listing });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reports = await getListingReports(id);
    res.json({ data: reports });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const users = await getAdminUsers(status as any, parseInt(page as string), parseInt(limit as string));
    res.json({ data: users, page: parseInt(page as string) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateUserStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await updateUserStatus(id, status as any, (req as any).user.id);
    res.json({ data: user });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const { period, dateFilter } = req.query;
    const stats = await getStatsService(period as 'day' | 'month' | 'year', dateFilter as string);
    res.json({ data: stats });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const printStats = async (req: Request, res: Response) => {
  try {
    const { period, dateFilter } = req.query;
    const stats = await getStatsService(period as 'day' | 'month' | 'year', dateFilter as string);
    const pdfBuffer = await generateStatsPDF(stats, pool);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stats.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};