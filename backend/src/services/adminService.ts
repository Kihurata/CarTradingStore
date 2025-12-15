import pool from '../config/database';
import { logAudit } from './auditService';
import { ListingStatus } from '../models/listing';
import { UserStatus } from '../models/user';

export async function getAdminListings(status?: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT l.*, u.name as seller_name, COALESCE(r.reports_count, 0) as reports_count
    FROM listings l
    JOIN users u ON l.seller_id = u.id
    LEFT JOIN (SELECT listing_id, COUNT(*) as reports_count FROM reports GROUP BY listing_id) r ON l.id = r.listing_id
    WHERE ($1::listing_status IS NULL OR l.status = $1)
    ORDER BY l.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const { rows } = await pool.query(query, [status, limit, offset]);
  return rows;
}

export async function updateListingStatus(listingId: string, status: ListingStatus, adminId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(
      'UPDATE listings SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3 RETURNING *',
      [status, adminId, listingId]
    );
    if (res.rowCount === 0) throw new Error('Listing not found');
    await logAudit(adminId, 'listing.status.change', 'listing', listingId, { newStatus: status });
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateListing(listingId: string, updates: Partial<any>, adminId: string) {
  const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(updates), listingId];
  const query = `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $${Object.keys(updates).length + 1} RETURNING *`;
  const { rows } = await pool.query(query, values);
  if (rows.length === 0) throw new Error('Listing not found');
  await logAudit(adminId, 'listing.update', 'listing', listingId, { changes: updates });
  return rows[0];
}

export async function getListingReports(listingId: string) {
  const { rows } = await pool.query(
    'SELECT r.*, u.name as reporter_name FROM reports r LEFT JOIN users u ON r.reporter_id = u.id WHERE r.listing_id = $1 ORDER BY r.created_at DESC',
    [listingId]
  );
  return rows;
}

export async function getAdminUsers(
  status: UserStatus | null = null,  // null = tất cả trạng thái
  page: number = 1,
  limit: number = 10
): Promise<{
  items: {
    id: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    status: UserStatus;
    total_listings: number;
  }[];
  total: number;
}> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      u.id,
      u.name,
      u.phone,
      u.address,
      u.status,
      COALESCE(COUNT(l.id), 0) AS total_listings,
      COUNT(*) OVER() AS total_count
    FROM users u
    LEFT JOIN listings l ON l.seller_id = u.id
    WHERE
      u.is_admin = FALSE
      AND ($1::user_status IS NULL OR u.status = $1)
    GROUP BY
      u.id, u.name, u.phone, u.address, u.status, u.created_at
    ORDER BY
      total_listings DESC,
      u.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [status, limit, offset]);

  const total = rows[0] ? Number(rows[0].total_count) : 0;

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    status: row.status as UserStatus,
    total_listings: Number(row.total_listings || 0),
  }));

  return { items, total };
}


export async function updateUserStatus(userId: string, status: UserStatus, adminId: string) {
  const { rows } = await pool.query(
    'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
    [status, userId]
  );
  if (rows.length === 0) throw new Error('User not found');
  await logAudit(adminId, 'user.status.change', 'user', userId, { newStatus: status });
  return rows[0];
}