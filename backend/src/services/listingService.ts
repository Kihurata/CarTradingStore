import pool from '../config/database';
import { Listing, ListingStatus, createListing as prepareListing } from '../models/listing';  
import { AuditLog, ReportType } from '../models/other';
import { logAudit } from './auditService';

export const getAllListings = async (status?: ListingStatus): Promise<Listing[]> => {
  try {
    const query = status 
      ? 'SELECT * FROM listings WHERE status = $1 ORDER BY created_at DESC' 
      : 'SELECT * FROM listings ORDER BY created_at DESC';
    const values = status ? [status] : [];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw new Error('Database query failed');
  }
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw new Error('Database query failed');
  }
};

export const createListing = async (listingData: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'edits_count' | 'reports_count'>): Promise<Listing> => {
  try {
    const newListing = prepareListing(listingData); 
    const result = await pool.query(
      `INSERT INTO listings (
        id, seller_id, title, price_vnd, brand, model, year, mileage_km, gearbox, fuel, 
        body_type, seats, color_ext, color_int, location_text, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        newListing.id, newListing.seller_id, newListing.title, newListing.price_vnd, newListing.brand,
        newListing.model, newListing.year, newListing.mileage_km || null, newListing.gearbox || null, newListing.fuel || null,
        newListing.body_type || null, newListing.seats || null, newListing.color_ext || null, newListing.color_int || null,
        newListing.location_text || null, newListing.description || null, newListing.status
      ]
    );
    
    await logAudit({ actor_id: newListing.seller_id, action: 'listing.create', target_type: 'listing', target_id: newListing.id });
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating listing:', error);
    throw new Error('Failed to create listing');
  }
};

export const updateListingStatus = async (id: string, status: ListingStatus, approver_id?: string): Promise<Listing | null> => {
  try {
    const updateQuery = approver_id 
      ? 'UPDATE listings SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3 RETURNING *'
      : 'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *';
    const values = approver_id ? [status, approver_id, id] : [status, id];
    const result = await pool.query(updateQuery, values);
    
    if (result.rows[0]) {
      await logAudit({ actor_id: approver_id || 'system', action: `listing.status.change`, target_type: 'listing', target_id: id, metadata: { new_status: status } });
    }
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating listing status:', error);
    throw new Error('Failed to update listing status');
  }
};

export const deleteListing = async (id: string): Promise<void> => {
  try {
    await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    await logAudit({ actor_id: 'system', action: 'listing.delete', target_type: 'listing', target_id: id });
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw new Error('Failed to delete listing');
  }
};

// UC5.1: Quản lý bài đăng của user
export const getUserListings = async (userId: string): Promise<Listing[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw new Error('Database query failed');
  }
};

// UC5.2: Chỉnh sửa bài đăng
export const updateListing = async (
  listingId: string,
  updateData: Partial<Omit<Listing, 'id' | 'seller_id' | 'status' | 'created_at' | 'updated_at' | 'views_count' | 'edits_count' | 'reports_count'>>,
  userId: string
): Promise<Listing | null> => {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const updatableFields = [
      'title', 'price_vnd', 'brand', 'model', 'year', 'mileage_km', 'gearbox', 'fuel',
      'body_type', 'seats', 'color_ext', 'color_int', 'location_text', 'description'
    ];

    updatableFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        setClauses.push(`${field} = $${paramIndex}`);
        values.push(updateData[field as keyof typeof updateData]);
        paramIndex++;
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClauses.push('updated_at = NOW()');
    setClauses.push('edits_count = edits_count + 1');

    const query = `
      UPDATE listings 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex} AND seller_id = $${paramIndex + 1} 
      RETURNING *
    `;
    values.push(listingId, userId);

    const result = await pool.query(query, values);

    if (result.rows[0]) {
      await logAudit({
        actor_id: userId,
        action: 'listing.update',
        target_type: 'listing',
        target_id: listingId,
        metadata: { updated_fields: Object.keys(updateData) }
      });
    }

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw new Error('Failed to update listing');
  }
};

// UC4.2 A1: Thêm yêu thích
export const addFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO favorites (id, user_id, listing_id) 
       VALUES (gen_random_uuid(), $1, $2) 
       ON CONFLICT (user_id, listing_id) DO NOTHING`,
      [userId, listingId]
    );

    await logAudit({
      actor_id: userId,
      action: 'favorite.add',
      target_type: 'listing',
      target_id: listingId
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw new Error('Failed to add favorite');
  }
};

// UC4.2 A2: So sánh bài đăng
export const addComparison = async (
  userId: string,
  leftListingId: string,
  rightListingId: string
): Promise<any> => {  // Simplified return for now
  try {
    const result = await pool.query(
      `INSERT INTO comparisons (id, user_id, left_listing_id, right_listing_id) 
       VALUES (gen_random_uuid(), $1, $2, $3) 
       RETURNING *`,
      [userId, leftListingId, rightListingId]
    );

    if (result.rows[0]) {
      await logAudit({
        actor_id: userId,
        action: 'comparison.add',
        target_type: 'comparison',
        target_id: result.rows[0].id,
        metadata: { left_listing_id: leftListingId, right_listing_id: rightListingId }
      });
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error adding comparison:', error);
    throw new Error('Failed to add comparison');
  }
};

// UC4.3: Báo cáo vi phạm
export const reportViolation = async (listingId: string, reporterId: string, type: ReportType, note?: string): Promise<any> => {
  try {
    const result = await pool.query(
      'INSERT INTO reports (id, listing_id, reporter_id, type, note) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
      [listingId, reporterId, type, note || null]
    );
    await logAudit({ actor_id: reporterId, action: 'report.create', target_type: 'listing', target_id: listingId, metadata: { type, note } });
    return result.rows[0];
  } catch (error) {
    console.error('Error reporting violation:', error);
    throw new Error('Failed to report violation');
  }
};