import { v4 as uuidv4 } from 'uuid';

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  HIDDEN = 'hidden',
  SOLD = 'sold'
}

export interface Listing {
  id: string;  // UUID
  seller_id: string;
  title: string;
  price_vnd: number;
  brand: string;
  model: string;
  year: number;
  mileage_km?: number;
  gearbox?: string;
  fuel?: string;
  body_type?: string;
  seats?: number;
  color_ext?: string;
  color_int?: string;
  location_text?: string;
  description?: string;
  status: ListingStatus;
  views_count: number;
  edits_count: number;
  reports_count: number;
  approved_at?: Date;
  approved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export const createListing = (partial: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'edits_count' | 'reports_count'>): Listing => ({
  id: uuidv4(),
  ...partial,
  views_count: 0,
  edits_count: 0,
  reports_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
});