// frontend/src/types/listing.ts
export interface CreateListingRequest {
  // Thông tin xe
  hangXe: string;
  dongXe: string;
  dongXeDung?: string;
  tinhTrang: string;
  xuatXu: string;
  namSanXuat: string;
  dienKy?: string;
  hopSo: string;
  nhienLieu: string;
  kieuDang?: string;
  soChoNgoi?: string;
  giaBan: string;
  
  // Mô tả
  tieuDe: string;
  moTa: string;
  
  // Thông tin người bán
  tenNguoiBan: string;
  soDienThoai: string;
  diaChiNguoiBan: string;
  noiVanXe: string;
  quanHuyen: string;
  
  // Media
  youtubeUrl?: string;
}

export interface Listing {
  id: string;
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
  description?: string;
  status: string;
  created_at: string;
  
  // Các trường mới
  seller_name: string;
  seller_phone: string;
  condition: string;
  origin: string;
  seller_address: string;
  district: string;
  youtube_url?: string;
  location_text?: string;
  thumbnail_url?: string;
  image_urls?: string[];
}