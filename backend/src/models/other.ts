import { v4 as uuidv4 } from 'uuid';
import { ListingStatus } from './listing';

export enum ReportType {
  SEEDING = 'seeding',
  FAKE = 'fake',
  SCAM = 'scam',
  OTHER = 'other'
}

export enum ReportStatus {
  NEW = 'new',
  REVIEWING = 'reviewing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  DISMISSED = 'dismissed'
}

export interface ListingImage {
  id: string;
  listing_id: string;
  file_key: string;
  public_url: string;
  is_approved: boolean;
  position: number;
  created_at: Date;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: Date;
}

export interface Comparison {
  id: string;
  user_id: string;
  left_listing_id: string;
  right_listing_id: string;
  created_at: Date;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  type: ReportType;
  note?: string;
  status: ReportStatus;
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export const createAuditLog = (partial: Omit<AuditLog, 'id' | 'created_at'>): AuditLog => ({
  id: uuidv4(),
  ...partial,
  created_at: new Date(),
});