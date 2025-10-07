import pool from '../config/database';
import { AuditLog, createAuditLog } from '../models/other';

export const logAudit = async (auditData: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> => {
  try {
    const newAudit = createAuditLog(auditData);
    const result = await pool.query(
      'INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newAudit.id, newAudit.actor_id || null, newAudit.action, newAudit.target_type, newAudit.target_id || null, newAudit.metadata || null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error logging audit:', error);
    throw new Error('Failed to log audit');
  }
};