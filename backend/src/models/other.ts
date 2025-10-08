// src/models/other.ts
// Interfaces and enums (kept as-is, assuming existing code for ListingImage, etc.)
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

// Import pool (CommonJS compatible)
import pool from '../config/database';

// Dynamic import for uuid (ESM-compatible in CommonJS/ts-node)
export const createAuditLog = async (
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: any
): Promise<AuditLog> => {
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();
  const { rows } = await pool.query(
    'INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, actorId, action, targetType, targetId, metadata || {}]
  );
  return rows[0] as AuditLog;
};