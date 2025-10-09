import pool from '../config/database';
import { logAudit } from './auditService';
import { ListingStatus } from '../models/listing';
import { Listing } from '../models/listing';

export async function getAllListings(
  status: string | undefined,
  page: number,
  limit: number
): Promise<{ items: Listing[]; total: number }> {
  const offset = (page - 1) * limit;

  const params: any[] = [];
  const where = [];

  if (status) {
    where.push(`l.status = $${params.length + 1}`);
    params.push(status);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      l.*,
      (
        SELECT li.public_url
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.position ASC, li.created_at ASC
        LIMIT 1
      ) AS thumbnail_url,
      COUNT(*) OVER() AS total_count
    FROM listings l
    ${whereSql}
    ORDER BY l.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;

  params.push(limit, offset);

  const { rows } = await pool.query(sql, params);

  const total = rows[0] ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count, ...rest }) => rest as Listing & { thumbnail_url?: string });

  return { items, total };
}
export async function getListingById(id: string) {
  const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
  if (rows.length > 0) {
    await logAudit('system', 'listing.view', 'listing', id);
  }
  return rows[0];
}

export async function createListing(sellerId: string, listingData: any) {
  const values = [
    sellerId,
    listingData.title,
    listingData.price_vnd,
    listingData.brand,
    listingData.model,
    listingData.year,
    listingData.mileage_km || null,
    listingData.gearbox || null,
    listingData.fuel || null,
    listingData.body_type || null,
    listingData.seats || null,
    listingData.color_ext || null,
    listingData.color_int || null,
    listingData.location_text || null,
    listingData.description || null
  ];
  const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');
  const query = `INSERT INTO listings (seller_id, title, price_vnd, brand, model, year, mileage_km, gearbox, fuel, body_type, seats, color_ext, color_int, location_text, description) VALUES ($1, ${placeholders}) RETURNING *`;
  const { rows: [newListing] } = await pool.query(query, values);
  await logAudit(sellerId, 'listing.create', 'listing', newListing.id);
  return newListing;
}

export async function updateListingStatus(id: string, status: ListingStatus, approver_id?: string) {
  await pool.query(
    'UPDATE listings SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3',
    [status, approver_id, id]
  );
  await logAudit(approver_id || 'system', 'listing.status.change', 'listing', id, { new_status: status });
  return { success: true };
}

export async function deleteListing(id: string) {
  await pool.query('DELETE FROM listings WHERE id = $1', [id]);
  await logAudit('system', 'listing.delete', 'listing', id);
  return { success: true };
}

export async function updateListing(id: string, updates: any, userId: string) {
  const setClause = Object.keys(updates).map((k, i) => `${k} = $${i+1}`).join(', ');
  const values = [...Object.values(updates), id];
  const query = `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $${Object.keys(updates).length + 1} RETURNING *`;
  const { rows: [updated] } = await pool.query(query, values);
  await logAudit(userId, 'listing.update', 'listing', id, { changes: updates });
  return updated;
}

export async function getAllListingsAdmin() {
  const { rows } = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');
  await logAudit('system', 'listing.list', 'listing', undefined);  // Fix: undefined instead of null
  return rows;
}

export async function getUserListings(userId: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return rows;
}

export async function addFavorite(userId: string, listingId: string) {
  const { rows } = await pool.query(
    'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) RETURNING *',
    [userId, listingId]
  );
  await logAudit(userId, 'favorite.add', 'listing', listingId);
  return rows[0];
}

export async function addComparison(userId: string, leftListingId: string, rightListingId: string) {
  const id = require('uuid').v4();
  const { rows } = await pool.query(
    'INSERT INTO comparisons (id, user_id, left_listing_id, right_listing_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, userId, leftListingId, rightListingId]
  );
  await logAudit(userId, 'comparison.add', 'comparison', id, { left: leftListingId, right: rightListingId });
  return rows[0];
}

export async function reportViolation(listingId: string, reporterId: string, type: string, note?: string) {
  const { rows: [newReport] } = await pool.query(
    'INSERT INTO reports (listing_id, reporter_id, type, note) VALUES ($1, $2, $3, $4) RETURNING *',
    [listingId, reporterId, type, note]
  );
  await logAudit(reporterId, 'report.create', 'listing', listingId, { type, note });
  return newReport;
}

