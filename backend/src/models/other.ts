export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: any;
  created_at: Date;
}

export interface ListingImage { /* ... existing ... */ }
export interface Favorite { /* ... existing ... */ }
export interface Comparison { /* ... existing ... */ }
export interface Report { /* ... existing ... */ }

export enum ReportType { /* ... existing ... */ }
export enum ReportStatus { /* ... existing ... */ }

import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createAuditLog = async (
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: any
): Promise<AuditLog> => {
  const id = uuidv4();
  const { rows } = await pool.query(
    'INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, actorId, action, targetType, targetId, metadata || {}]
  );
  return rows[0] as AuditLog;
};