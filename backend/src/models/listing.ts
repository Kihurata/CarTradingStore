export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  HIDDEN = 'hidden',
  SOLD = 'sold',
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  price_vnd: number;
  brand: string;
  model: string;
  brand_id: number;
  model_id: number;
  origin?: string; 
  province_id?: number; 
  district_id?: number; 
  address_line?: string;
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
  thumbnail_url?: string;
  video_url?: string;
  seller_name?: string;
  seller_phone?: string;
}

export const createListing = (listingData: Partial<Listing>): Listing => ({
  ...listingData,
  status: ListingStatus.PENDING,
  views_count: 0,
  edits_count: 0,
  reports_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
} as Listing);