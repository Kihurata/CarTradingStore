// src/services/listingService.ts
import pool from '../config/database';
import { logAudit } from './auditService';
import { ListingStatus } from '../models/listing';
import { Listing } from '../models/listing';
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabase";

export async function getAllListings(
  status: string | undefined,
  page: number,
  limit: number,
  filters?: { min_price?: number; max_price?: number; body_type?: string }
): Promise<{ items: (Listing & { thumbnail_url?: string; seller_name?: string | null; seller_phone?: string | null })[]; total: number }> {
  const offset = (page - 1) * limit;

  const params: (string | number)[] = [];
  const where: string[] = [];

  if (status) {
    params.push(status);
    where.push(`l.status = $${params.length}`);
  }

  if (filters?.min_price !== undefined) {
    params.push(filters.min_price);
    where.push(`l.price_vnd >= $${params.length}`);
  }

  if (filters?.max_price !== undefined) {
    params.push(filters.max_price);
    where.push(`l.price_vnd <= $${params.length}`);
  }

  if (filters?.body_type) {
    params.push(filters.body_type);
    // body_type là TEXT; dùng ILIKE để không phân biệt hoa thường
    where.push(`l.body_type ILIKE $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // limit/offset luôn ở 2 tham số cuối
  params.push(limit);
  params.push(offset);

  const sql = `
    SELECT
      l.*,
      b.name AS brand,
      m.name AS model,
      u.name  AS seller_name,
      u.phone AS seller_phone,
      (
        SELECT li.public_url
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.position ASC, li.created_at ASC
        LIMIT 1
      ) AS thumbnail_url,
      COUNT(*) OVER() AS total_count
    FROM listings l
    JOIN brands b ON l.brand_id = b.id
    JOIN models m ON l.model_id = m.id
    JOIN users  u ON u.id = l.seller_id
    ${whereSql}
    ORDER BY l.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;

  const { rows } = await pool.query(sql, params);

  const total = rows[0] ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count, ...rest }) =>
    (rest as Listing & { thumbnail_url?: string; seller_name?: string | null; seller_phone?: string | null })
  );

  return { items, total };
}


export async function getListingById(id: string) {
  const sql = `
    SELECT
      l.*,
      b.name AS brand,
      m.name AS model,
      u.name  AS seller_name,
      u.phone AS seller_phone,

      -- Ảnh đại diện: lấy ảnh approved đầu tiên theo position
      thumb.public_url AS thumbnail_url,

      -- Mảng ảnh gallery (đã sắp theo position)
      COALESCE(imgs.images, '[]'::json) AS images

    FROM listings l
    JOIN brands b ON l.brand_id = b.id
    JOIN models m ON l.model_id = m.id
    LEFT JOIN users u ON u.id = l.seller_id

    -- Lấy thumbnail
    LEFT JOIN LATERAL (
      SELECT li.public_url
      FROM listing_images li
      WHERE li.listing_id = l.id AND li.is_approved = TRUE
      ORDER BY li.position ASC, li.created_at ASC
      LIMIT 1
    ) AS thumb ON TRUE

    -- Lấy toàn bộ ảnh cho gallery
    LEFT JOIN LATERAL (
      SELECT json_agg(
               json_build_object(
                 'id', li.id,
                 'public_url', li.public_url,
                 'position', li.position
               )
               ORDER BY li.position ASC, li.created_at ASC
             ) AS images
      FROM listing_images li
      WHERE li.listing_id = l.id AND li.is_approved = TRUE
    ) AS imgs ON TRUE

    WHERE l.id::text = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
}


export async function createListing(data: {
  seller_id: string;
  title: string;
  price_vnd: number;
  brand_id: number;
  model_id: number;
  year?: number;
  mileage_km?: number;
  gearbox?: string;
  fuel?: string;
  body_type?: string;
  seats?: number;
  origin?: string;
  description?: string;
  province_id?: number;
  district_id?: number;
  address_line?: string;
  color_ext?: string;
  color_int?: string;
  video_url?: string;
  images?: Express.Multer.File[];
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Thêm validation trước INSERT (dự phòng nếu controller bỏ sót)
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }
    if (data.price_vnd <= 0) {
      throw new Error("Price must be greater than 0");
    }
    if (!data.brand_id || !data.model_id) {
      throw new Error("Brand ID and Model ID are required");
    }
    if (!data.year || data.year < 1900) {
      throw new Error("Year must be >= 1900");
    }
    if (data.mileage_km !== undefined && data.mileage_km < 0) {
      throw new Error("Mileage must be >= 0");
    }
    if (data.color_ext && !/^#([0-9A-Fa-f]{6})$/.test(data.color_ext)) {
      throw new Error("Exterior color must be hex #RRGGBB");
    }
    if (data.color_int && !/^#([0-9A-Fa-f]{6})$/.test(data.color_int)) {
      throw new Error("Interior color must be hex #RRGGBB");
    }

    // 1. Tạo bản ghi listing
    const listingId = uuidv4();
    await client.query(
      `
      INSERT INTO listings (
        id, seller_id, title, price_vnd, brand_id, model_id, year, mileage_km, gearbox,
        fuel, body_type, seats, color_ext, color_int, origin, description,
        province_id, district_id, address_line, video_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      `,
      [
        listingId,
        data.seller_id,
        data.title,
        data.price_vnd,
        data.brand_id,
        data.model_id,
        data.year,
        data.mileage_km || null,
        data.gearbox || null,
        data.fuel || null,
        data.body_type || null,
        data.seats || null,
        data.color_ext || null,
        data.color_int || null,
        data.origin || null,
        data.description || null,
        data.province_id || null,
        data.district_id || null,
        data.address_line || null,
        data.video_url || null,
      ]
    );

    // 2. Upload images nếu có
    if (data.images && data.images.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of data.images) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `pending/${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET!)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from(process.env.SUPABASE_BUCKET!)
          .getPublicUrl(fileName);

        const imageUrl = publicData.publicUrl;
        uploadedUrls.push(imageUrl);

        await client.query(
          `INSERT INTO listing_images (listing_id, file_key, public_url, position)
           VALUES ($1,$2,$3,$4)`,
          [listingId, fileName, imageUrl, uploadedUrls.length]
        );
      }
    }

    await client.query("COMMIT");
    await logAudit(data.seller_id, 'listing.create', 'listing', listingId);
    return { id: listingId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createListing error:", err);
    throw err;
  } finally {
    client.release();
  }
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
  const sql = `
    SELECT
      l.*,
      b.name AS brand,
      m.name AS model
    FROM listings l
    JOIN brands b ON l.brand_id = b.id
    JOIN models m ON l.model_id = m.id
    ORDER BY l.created_at DESC
  `;
  const { rows } = await pool.query(sql);
  // === HẾT THAY ĐỔI ===
  await logAudit('system', 'listing.list', 'listing', undefined);
  return rows;
}

export async function getUserListings(userId: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT
      l.*,
      b.name AS brand,
      m.name AS model
    FROM listings l
    JOIN brands b ON l.brand_id = b.id
    JOIN models m ON l.model_id = m.id
    WHERE l.seller_id = $1
    ORDER BY l.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const { rows } = await pool.query(sql, [userId, limit, offset]);
  // === HẾT THAY ĐỔI ===
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

// Lấy danh sách tỉnh/thành
export async function listProvinces(): Promise<{ id: number; name: string }[]> {
  const { rows } = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM provinces ORDER BY name"
  );
  return rows;
}

// Lấy danh sách quận/huyện theo tỉnh
export async function listDistrictsByProvince(
  provinceId: number
): Promise<{ id: number; name: string }[]> {
  const { rows } = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM districts WHERE province_id = $1 ORDER BY name",
    [provinceId]
  );
  return rows;
}

// Lấy danh sách brands
export async function listBrands(): Promise<{ id: number; name: string }[]> {
  const { rows } = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM brands ORDER BY name"
  );
  return rows;
}

// Lấy danh sách models theo brand
export async function listModelsByBrand(
  brandId: number
): Promise<{ id: number; name: string }[]> {
  const { rows } = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM models WHERE brand_id = $1 ORDER BY name",
    [brandId]
  );
  return rows;
}