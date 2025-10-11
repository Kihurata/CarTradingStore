// backend/src/models/listing.ts
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
<<<<<<< Updated upstream
=======
  thumbnail_url?: string;
  
  // THÊM CÁC TRƯỜNG MỚI TỪ FORM
  seller_name: string;
  seller_phone: string;
  condition: string; // xe-cu, xe-moi
  origin: string; // trong-nuoc, nhap-khau
  seller_address: string;
  district: string;
  youtube_url?: string;
>>>>>>> Stashed changes
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