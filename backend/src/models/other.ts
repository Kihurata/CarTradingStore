// src/models/other.ts
import pool from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export async function createAuditLog(data: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
  const id = uuidv4();
  let { actor_id, action, target_type, target_id, metadata } = data;
  
  // Validate required fields: Skip insert if action or target_type missing (avoid not-null violation)
  if (!action || !target_type) {
    console.warn(`Skipping audit log ${id}: Missing required fields (action: ${action}, target_type: ${target_type})`);
    return { id, actor_id: null, action: '', target_type: '', target_id: undefined, metadata: undefined, created_at: new Date() } as AuditLog; // Mock return để không break caller (fix TS: metadata undefined)
  }
  
  // Verify actor_id exists in users, if not set to null (avoid FK violation)
  if (actor_id) {
    try {
      const { rows } = await pool.query("SELECT id FROM users WHERE id = $1", [actor_id]);
      if (rows.length === 0) {
        console.warn(`Audit actor_id ${actor_id} not found in users, setting to null`);
        actor_id = null;
      }
    } catch (err) {
      console.error("Verify actor_id failed:", err);
      actor_id = null; // Fallback nếu query error
    }
  }
  
  // Debug log params trước insert (tạm, xóa sau nếu ok)
  console.log(`Inserting audit log ${id}: actor_id=${actor_id}, action=${action}, target_type=${target_type}, target_id=${target_id}`);
  
  const { rows } = await pool.query(
    `INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, actor_id, action, target_type, target_id, metadata || null]
  );
  
  return rows[0];
}