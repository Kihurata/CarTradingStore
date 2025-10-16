<<<<<<< Updated upstream
// backend/src/services/listingService.ts
=======
// src/services/listingService.ts
>>>>>>> Stashed changes
import pool from '../config/database';
import { logAudit } from './auditService';
<<<<<<< Updated upstream
import { ListingStatus } from '../models/listing';
<<<<<<< Updated upstream


export async function getAllListings(status?: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM listings WHERE ($1::listing_status IS NULL OR status = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  const { rows } = await pool.query(query, [status, limit, offset]);
  return rows;
=======
import { ListingStatus, Listing } from '../models/listing';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
=======
import { Listing } from '../models/listing';
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabase";
>>>>>>> Stashed changes

export async function getAllListings(
  status: string | undefined, 
  page: number, 
  limit: number, 
  filters?: { 
    min_price?: number; 
    max_price?: number; 
    body_type?: string;
    brand?: string;
    condition?: string;
  }
): Promise<{ items: Listing[]; total: number }> {
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
    where.push(`l.body_type ILIKE $${params.length}`);
  }

  if (filters?.brand) {
    params.push(`%${filters.brand}%`);
    where.push(`l.brand ILIKE $${params.length}`);
  }

  if (filters?.condition) {
    params.push(filters.condition);
    where.push(`l.condition = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(limit);
  params.push(offset);

  const sql = `
    SELECT l.*, 
    (SELECT li.public_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.position ASC, li.created_at ASC LIMIT 1) AS thumbnail_url,
    COUNT(*) OVER() AS total_count 
    FROM listings l 
    ${whereSql} 
    ORDER BY l.created_at DESC 
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const { rows } = await pool.query(sql, params);
  const total = rows[0] ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count, ...rest }) => rest as Listing & { thumbnail_url?: string });
  
  return { items, total };
>>>>>>> Stashed changes
}

export async function getListingById(id: string) {
  const { rows } = await pool.query(`
    SELECT l.*, 
    ARRAY_AGG(li.public_url ORDER BY li.position) as image_urls
    FROM listings l 
    LEFT JOIN listing_images li ON l.id = li.listing_id 
    WHERE l.id = $1 
    GROUP BY l.id
  `, [id]);
  
  if (rows.length > 0) {
    await logAudit('system', 'listing.view', 'listing', id);
  }
  return rows[0];
}

<<<<<<< Updated upstream
export async function createListing(sellerId: string, rawData: any, imageFiles: Express.Multer.File[] = []) {
  // VALIDATE SELLER_ID
  if (!sellerId) {
    throw new Error('Seller ID is required');
  }

  console.log('Creating listing for seller:', sellerId);

  // VALIDATE VÀ CHUYỂN ĐỔI DỮ LIỆU
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;
  
  const listingData = {
    title: rawData.tieuDe,
    price_vnd: parseInt(rawData.giaBan?.replace(/\D/g, '')) || 0,
    brand: rawData.hangXe,
    model: rawData.dongXe,
    year: parseInt(rawData.namSanXuat) || currentYear,
    mileage_km: rawData.dienKy ? parseInt(rawData.dienKy) : null,
    gearbox: rawData.hopSo,
    fuel: rawData.nhienLieu,
    body_type: rawData.kieuDang,
    seats: rawData.soChoNgoi ? parseInt(rawData.soChoNgoi) : null,
    description: rawData.moTa,
    
    // CÁC TRƯỜNG MỚI
    seller_name: rawData.tenNguoiBan,
    seller_phone: rawData.soDienThoai,
    condition: rawData.tinhTrang,
    origin: rawData.xuatXu,
    seller_address: rawData.diaChiNguoiBan,
    district: rawData.quanHuyen,
    youtube_url: rawData.youtubeUrl || null,
    
    // Tạo location_text từ các trường
    location_text: `${rawData.noiVanXe}, ${rawData.quanHuyen}, ${rawData.diaChiNguoiBan}`
  };

  // VALIDATION CHI TIẾT
  const requiredFields = ['title', 'brand', 'model', 'year', 'price_vnd', 'seller_name', 'seller_phone'];
  const missingFields = requiredFields.filter(field => !listingData[field as keyof typeof listingData]);
  
  if (missingFields.length > 0) {
    throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
  }

  if (listingData.price_vnd <= 0) {
    throw new Error('Giá bán phải lớn hơn 0');
  }

  // VALIDATE NĂM SẢN XUẤT
  if (listingData.year < 1900 || listingData.year > maxYear) {
    throw new Error(`Năm sản xuất phải từ 1900 đến ${maxYear}`);
  }

  // VALIDATE SỐ KM
  if (listingData.mileage_km && listingData.mileage_km < 0) {
    throw new Error('Số km không hợp lệ');
  }

  // VALIDATE SỐ CHỖ
  if (listingData.seats && listingData.seats < 1) {
    throw new Error('Số chỗ ngồi phải lớn hơn 0');
  }

  console.log('Validated listing data:', listingData);

  // INSERT VÀO DATABASE
  const query = `
    INSERT INTO listings (
      seller_id, title, price_vnd, brand, model, year, mileage_km, 
      gearbox, fuel, body_type, seats, description, seller_name, 
      seller_phone, condition, origin, seller_address, district, 
      youtube_url, location_text, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    RETURNING *
  `;

  const values = [
    sellerId,
    listingData.title,
    listingData.price_vnd,
    listingData.brand,
    listingData.model,
    listingData.year,
    listingData.mileage_km,
    listingData.gearbox,
    listingData.fuel,
    listingData.body_type,
    listingData.seats,
    listingData.description,
    listingData.seller_name,
    listingData.seller_phone,
    listingData.condition,
    listingData.origin,
    listingData.seller_address,
    listingData.district,
    listingData.youtube_url,
    listingData.location_text,
    ListingStatus.PENDING
  ];

  console.log('Executing query with values:', values);

  try {
    const { rows: [newListing] } = await pool.query(query, values);
    
    console.log('New listing created:', newListing);
    
    // UPLOAD ẢNH LÊN SUPABASE STORAGE
    if (imageFiles && imageFiles.length > 0) {
      console.log(`Starting upload of ${imageFiles.length} images to Supabase...`);
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const fileExt = imageFile.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `listings/${newListing.id}/${fileName}`;

        console.log(`Uploading image ${i+1} to Supabase:`, filePath);

        try {
          // Upload buffer lên Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .upload(filePath, imageFile.buffer, {
              contentType: imageFile.mimetype,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error(`Lỗi upload ảnh lên cloud: ${uploadError.message}`);
          }

          // Lấy public URL
          const { data: publicUrlData } = supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .getPublicUrl(filePath);

          console.log('Image uploaded successfully:', publicUrlData.publicUrl);

          // Lưu vào database
          await pool.query(
            'INSERT INTO listing_images (listing_id, position, original_name, public_url, file_key) VALUES ($1, $2, $3, $4, $5)',
            [newListing.id, i, imageFile.originalname, publicUrlData.publicUrl, filePath]
          );

          console.log(`Image ${i+1} saved to database`);

        } catch (error) {
          console.error('Error in image upload process:', error);
          throw new Error(`Lỗi xử lý ảnh: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      console.log('All images uploaded successfully');
    }

    await logAudit(sellerId, 'listing.create', 'listing', newListing.id);
    
    return newListing;
  } catch (error) {
    console.error('Database error details:', error);
    throw new Error('Lỗi khi lưu thông tin xe vào database: ' + (error instanceof Error ? error.message : String(error)));
=======
export async function createListing(data: {
  seller_id: string;
  title: string;
  price_vnd: number;
  brand: string;
  model: string;
  year?: number;
  gearbox?: string;
  fuel?: string;
  body_type?: string;
  seats?: number;
  origin?: string;
  description?: string;
  province_id?: number;
  district_id?: number;
  address_line?: string;
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

    // 1. Tạo bản ghi listing
    const listingId = uuidv4();
    await client.query(
      `
      INSERT INTO listings (
        id, seller_id, title, price_vnd, brand, model, year, gearbox,
        fuel, body_type, seats, origin, description,
        province_id, district_id, address_line
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      `,
      [
        listingId,
        data.seller_id,
        data.title,
        data.price_vnd,
        data.brand || null,
        data.model || null,
        data.year || null,
        data.gearbox || null,
        data.fuel || null,
        data.body_type || null,
        data.seats || null,
        data.origin || null,
        data.description || null,
        data.province_id || null,
        data.district_id || null,
        data.address_line || null,
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
>>>>>>> Stashed changes
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
  const { rows } = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');
  await logAudit('system', 'listing.list', 'listing', undefined);
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
  const id = uuidv4();
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

<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
