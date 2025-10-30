export enum ListingStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SOLD = "sold",
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
  approved_at?: string | null; // backend có thể trả về ISO string
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  seller_name?: string;
  seller_phone?: string;
}