import pool from '../config/database';
import { Listing, ListingStatus, createListing as prepareListing } from '../models/listing';  
import { AuditLog } from '../models/other';
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
    
    // Log audit
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