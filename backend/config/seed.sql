-- ===============================================
-- DỮ LIỆU MẪU CHO CAR TRADING STORE
-- ===============================================

-- 1️⃣ USER MẪU (người bán)
INSERT INTO users (id, email, password_hash, name, phone, is_admin)
VALUES (gen_random_uuid(), 'seller@example.com', 'hash', 'Nguyen Van A', '0909123456', false)
ON CONFLICT (email) DO NOTHING;

-- INSERT PROVINCES & DISTRICTS
INSERT INTO provinces (id, name) VALUES
(1,'Hà Nội'),
(2,'Hồ Chí Minh'); -- nếu bạn đã có 63 trước đó, đảm bảo không trùng

-- Hà Nội (province_id = 1) — ví dụ
INSERT INTO districts (id, province_id, name) VALUES
(1001, 1, 'Ba Đình'),
(1002, 1, 'Hoàn Kiếm'),
(1003, 1, 'Đống Đa'),
(1004, 1, 'Hai Bà Trưng'),
(1005, 1, 'Cầu Giấy');

-- TP. Hồ Chí Minh (province_id = 2) — ví dụ
INSERT INTO districts (id, province_id, name) VALUES
(2001, 2, 'Quận 1'),
(2002, 2, 'Quận 3'),
(2003, 2, 'Quận 5'),
(2004, 2, 'Bình Thạnh'),
(2005, 2, 'Thủ Đức');


/* * TẬP LỆNH SEED CHO BẢNG BRANDS VÀ MODELS
 * Sử dụng cú pháp "WITH...RETURNING" để đảm bảo tính toàn vẹn dữ liệu
 */

-- === 1. Toyota ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Toyota') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Vios', 'Camry', 'Fortuner', 'Corolla Altis', 'Innova', 'Raize', 'Yaris', 'Hilux', 'Land Cruiser'
]) AS model_name;

-- === 2. Honda ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Honda') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Civic', 'City', 'CR-V', 'HR-V', 'Accord', 'Brio'
]) AS model_name;

-- === 3. Hyundai (Hãng xe từ ảnh của bạn) ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Hyundai') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Veloster', 'Santa Fe', 'Tucson', 'Elantra', 'Accent', 'Creta', 'Grand i10', 'Kona', 'Stargazer'
]) AS model_name;

-- === 4. Ford ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Ford') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Ranger', 'Everest', 'Territory', 'Transit', 'Explorer', 'Focus'
]) AS model_name;

-- === 5. Kia ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Kia') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Morning', 'K3', 'K5', 'Seltos', 'Carnival', 'Sonet', 'Soluto', 'Sportage', 'Carens'
]) AS model_name;

-- === 6. Mitsubishi ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Mitsubishi') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Xpander', 'Outlander', 'Triton', 'Pajero Sport', 'Attrage'
]) AS model_name;

-- === 7. VinFast ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('VinFast') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'VF 5', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34', 'Lux A2.0', 'Lux SA2.0', 'Fadil'
]) AS model_name;

-- === 8. Mercedes-Benz ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Mercedes-Benz') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'G-Class', 'Maybach S-Class', 'V-Class'
]) AS model_name;

-- === 9. BMW ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('BMW') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  '3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', '4 Series'
]) AS model_name;

-- === 10. Mazda ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Mazda') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  'Mazda2', 'Mazda3', 'Mazda6', 'CX-5', 'CX-8', 'BT-50'
]) AS model_name;

-- === 11. Peugeot (Bổ sung) ===
WITH brand AS (
  INSERT INTO brands (name) VALUES ('Peugeot') RETURNING id
)
INSERT INTO models (brand_id, name)
SELECT id, model_name
FROM brand, unnest(ARRAY[
  '3008', '5008', '2008'
]) AS model_name;


-- 2️⃣ LISTING MẪU (10 bài đăng xe)
-- Sử dụng INSERT ... SELECT ... với VALUES lồng trong FROM

DO $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM users WHERE email='seller@example.com';

  IF uid IS NOT NULL THEN
    
    INSERT INTO listings (
      seller_id, title, price_vnd, 
      brand_id, model_id, 
      year, mileage_km,
      gearbox, fuel, body_type, seats, color_ext, color_int,
      location_text, description, status, views_count
    )
    SELECT
      uid, 
      r.title, r.price_vnd,
      b.id, -- Lấy brand_id từ bảng brands
      m.id, -- Lấy model_id từ bảng models
      r.year, r.mileage_km,
      r.gearbox, r.fuel, r.body_type, r.seats, r.color_ext, r.color_int,
      r.location_text, r.description, r.status::listing_status, r.views_count
      
    -- Thay vì dùng WITH, ta định nghĩa bảng tạm ngay trong FROM
    FROM (
      VALUES
        ('Toyota Vios 1.5G 2020 – Giá tốt, xe đẹp như mới', 465000000, 'Toyota', 'Vios', 2020, 42000,
         'AT', 'xăng', 'sedan', 5, '#FFFFFF', '#000000', 'TP.HCM - Quận 7',
         'Xe chính chủ, bảo dưỡng định kỳ Toyota Lý Thường Kiệt.', 'approved', 135),
        ('Honda City 1.5RS 2021 – bản thể thao, còn rất mới', 575000000, 'Honda', 'City', 2021, 30000,
         'CVT', 'xăng', 'sedan', 5, '#FF0000', '#000000', 'Hà Nội - Cầu Giấy',
         'Xe đi kỹ, nội thất thể thao, gầm bệ chắc chắn.', 'approved', 240),
        ('Mazda CX-5 2.0L 2019 – SUV tiết kiệm, biển SG', 720000000, 'Mazda', 'CX-5', 2019, 60000,
         'AT', 'xăng', 'SUV', 5, '#007BFF', '#FFFDD0', 'TP.HCM - Bình Thạnh',
         'Xe cá nhân sử dụng, bảo dưỡng Mazda Trường Chinh.', 'approved', 312),
        ('Hyundai Accent 1.4AT 2020 – bản đặc biệt', 455000000, 'Hyundai', 'Accent', 2020, 50000,
         'AT', 'xăng', 'sedan', 5, '#C0C0C0', '#000000', 'Đà Nẵng - Hải Châu',
         'Xe gia đình, không kinh doanh, nội thất đẹp.', 'approved', 98),
        ('Kia Seltos 1.4 Turbo 2022 – chạy 15.000km', 715000000, 'Kia', 'Seltos', 2022, 15000,
         'AT', 'xăng', 'SUV', 5, '#FFA500', '#000000', 'Hà Nội - Long Biên',
         'Xe mới 99%, bao test hãng, nội thất cao cấp.', 'approved', 402),
        ('Ford Ranger Wildtrak 2.0 4x4 2021 – siêu lướt', 950000000, 'Ford', 'Ranger', 2021, 25000,
         'AT', 'dầu', 'pickup', 5, '#808080', '#000000', 'TP.HCM - Tân Bình',
         'Xe ít chạy, bảo dưỡng đầy đủ, không ngập nước.', 'approved', 370),
        ('VinFast Lux A2.0 2020 – bản cao cấp Turbo', 680000000, 'VinFast', 'Lux A2.0', 2020, 40000,
         'AT', 'xăng', 'sedan', 5, '#000000', '#8B4513', 'Hải Phòng - Ngô Quyền',
         'Xe đại lý mua mới, sang tên ngay.', 'approved', 289),
        ('Mercedes-Benz C-Class 2018 – xe nhập, full option', 1290000000, 'Mercedes-Benz', 'C-Class', 2018, 70000,
         'AT', 'xăng', 'sedan', 5, '#FFFFFF', '#FF0000', 'TP.HCM - Quận 1',
         'Xe sang, bản full, hỗ trợ trả góp.', 'approved', 510),
        ('Mitsubishi Xpander 1.5AT 2021 – xe gia đình chuẩn', 590000000, 'Mitsubishi', 'Xpander', 2021, 35000,
         'AT', 'xăng', 'MPV', 7, '#C0C0C0', '#000000', 'Cần Thơ - Ninh Kiều',
         'Xe gia đình, rộng rãi, tiết kiệm nhiên liệu.', 'approved', 210),
        ('Peugeot 3008 Allure 2020 – thiết kế châu Âu, chạy 40k', 875000000, 'Peugeot', '3008', 2020, 40000,
         'AT', 'xăng', 'SUV', 5, '#FFFFFF', '#000000', 'Hà Nội - Ba Đình',
         'Xe chuẩn châu Âu, nội thất cực đẹp, hỗ trợ trả góp.', 'approved', 177)
    ) AS r ( -- Đặt tên cho bảng tạm và các cột của nó
      title, price_vnd, brand_name, model_name, year, mileage_km,
      gearbox, fuel, body_type, seats, color_ext, color_int,
      location_text, description, status, views_count
    )
    -- JOIN để tra cứu ID
    JOIN brands b ON r.brand_name = b.name
    JOIN models m ON r.model_name = m.name AND m.brand_id = b.id;

  END IF;
END$$;

-- 3️⃣ ẢNH MẪU (1 ảnh/xe, đã cập nhật)
WITH imgs AS (
  SELECT * FROM (VALUES
    ('Toyota','Vios','cars/vios-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/vios-2020.jpg'),
    ('Honda','City','cars/city-rs-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/city-rs-2021.jpg'),
    ('Mazda','CX-5','cars/cx5-2019.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/cx5-2019.jpg'),
    ('Hyundai','Accent','cars/accent-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/accent-2020.png'),
    ('Kia','Seltos','cars/seltos-2022.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/seltos-2022.webp'),
    ('Ford','Ranger','cars/ranger-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/ranger-2021.webp'),
    ('VinFast','Lux A2.0','cars/luxa20-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/luxa20-2020.jpg'),
    
    -- SỬA LỖI: Phải khớp với data đã seed trong brands/models
    ('Mercedes-Benz','C-Class','cars/c300amg-2018.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/c300amg-2018.webp'),
    
    ('Mitsubishi','Xpander','cars/xpander-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/xpander-2021.avif'),
    ('Peugeot','3008','cars/peugeot3008-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/peugeot3008-2020.webp')
  ) AS t(brand_name, model_name, file_key, public_url) -- Đổi tên cột cho rõ ràng
)
INSERT INTO listing_images (listing_id, file_key, public_url, position)
SELECT 
  l.id,         -- ID của bài đăng
  i.file_key,   -- Đường dẫn file từ CTE 'imgs'
  i.public_url, -- URL công khai từ CTE 'imgs'
  0             -- Vị trí ảnh (đặt là 0)
FROM listings l
-- CẬP NHẬT LOGIC JOIN:
-- 1. Join 'listings' với 'models' bằng 'model_id'
JOIN models m ON l.model_id = m.id
-- 2. Join 'listings' (hoặc 'models') với 'brands' bằng 'brand_id'
JOIN brands b ON l.brand_id = b.id
-- 3. Dùng TÊN từ 'brands' và 'models' để join với bảng 'imgs'
JOIN imgs i ON b.name = i.brand_name AND m.name = i.model_name
ON CONFLICT DO NOTHING;



-- ✅ KẾT THÚC SEED
