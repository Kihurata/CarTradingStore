-- ===============================================
-- DỮ LIỆU MẪU CHO CAR TRADING STORE
-- ===============================================

-- 1️⃣ USER MẪU (người bán)
INSERT INTO users (id, email, password_hash, name, phone, is_admin)
VALUES (gen_random_uuid(), 'seller@example.com', 'hash', 'Nguyen Van A', '0909123456', false)
ON CONFLICT (email) DO NOTHING;

-- 2️⃣ LISTING MẪU (10 bài đăng xe)
DO $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM users WHERE email='seller@example.com';

  IF uid IS NOT NULL THEN
    INSERT INTO listings (
      seller_id, title, price_vnd, brand, model, year, mileage_km,
      gearbox, fuel, body_type, seats, color_ext, color_int,
      location_text, description, status, views_count
    )
    VALUES
    (uid, 'Toyota Vios 1.5G 2020 – Giá tốt, xe đẹp như mới', 465000000, 'Toyota', 'Vios', 2020, 42000,
     'AT', 'xăng', 'sedan', 5, 'trắng', 'đen', 'TP.HCM - Quận 7',
     'Xe chính chủ, bảo dưỡng định kỳ Toyota Lý Thường Kiệt.', 'approved', 135),
    (uid, 'Honda City 1.5RS 2021 – bản thể thao, còn rất mới', 575000000, 'Honda', 'City', 2021, 30000,
     'CVT', 'xăng', 'sedan', 5, 'đỏ', 'đen', 'Hà Nội - Cầu Giấy',
     'Xe đi kỹ, nội thất thể thao, gầm bệ chắc chắn.', 'approved', 240),
    (uid, 'Mazda CX-5 2.0L 2019 – SUV tiết kiệm, biển SG', 720000000, 'Mazda', 'CX-5', 2019, 60000,
     'AT', 'xăng', 'SUV', 5, 'xanh', 'kem', 'TP.HCM - Bình Thạnh',
     'Xe cá nhân sử dụng, bảo dưỡng Mazda Trường Chinh.', 'approved', 312),
    (uid, 'Hyundai Accent 1.4AT 2020 – bản đặc biệt', 455000000, 'Hyundai', 'Accent', 2020, 50000,
     'AT', 'xăng', 'sedan', 5, 'bạc', 'đen', 'Đà Nẵng - Hải Châu',
     'Xe gia đình, không kinh doanh, nội thất đẹp.', 'approved', 98),
    (uid, 'Kia Seltos 1.4 Turbo 2022 – chạy 15.000km', 715000000, 'Kia', 'Seltos', 2022, 15000,
     'AT', 'xăng', 'SUV', 5, 'cam', 'đen', 'Hà Nội - Long Biên',
     'Xe mới 99%, bao test hãng, nội thất cao cấp.', 'approved', 402),
    (uid, 'Ford Ranger Wildtrak 2.0 4x4 2021 – siêu lướt', 950000000, 'Ford', 'Ranger', 2021, 25000,
     'AT', 'dầu', 'pickup', 5, 'xám', 'đen', 'TP.HCM - Tân Bình',
     'Xe ít chạy, bảo dưỡng đầy đủ, không ngập nước.', 'approved', 370),
    (uid, 'VinFast Lux A2.0 2020 – bản cao cấp Turbo', 680000000, 'VinFast', 'Lux A2.0', 2020, 40000,
     'AT', 'xăng', 'sedan', 5, 'đen', 'nâu', 'Hải Phòng - Ngô Quyền',
     'Xe đại lý mua mới, sang tên ngay.', 'approved', 289),
    (uid, 'Mercedes C300 AMG 2018 – xe nhập, full option', 1290000000, 'Mercedes', 'C300 AMG', 2018, 70000,
     'AT', 'xăng', 'sedan', 5, 'trắng', 'đỏ', 'TP.HCM - Quận 1',
     'Xe sang, bản full, hỗ trợ trả góp.', 'approved', 510),
    (uid, 'Mitsubishi Xpander 1.5AT 2021 – xe gia đình chuẩn', 590000000, 'Mitsubishi', 'Xpander', 2021, 35000,
     'AT', 'xăng', 'MPV', 7, 'bạc', 'đen', 'Cần Thơ - Ninh Kiều',
     'Xe gia đình, rộng rãi, tiết kiệm nhiên liệu.', 'approved', 210),
    (uid, 'Peugeot 3008 Allure 2020 – thiết kế châu Âu, chạy 40k', 875000000, 'Peugeot', '3008', 2020, 40000,
     'AT', 'xăng', 'SUV', 5, 'trắng', 'đen', 'Hà Nội - Ba Đình',
     'Xe chuẩn châu Âu, nội thất cực đẹp, hỗ trợ trả góp.', 'approved', 177);
  END IF;
END$$;

-- 3️⃣ ẢNH MẪU (1 ảnh/xe, từ Supabase bucket "cars")
WITH imgs AS (
  SELECT * FROM (VALUES
    ('Toyota','Vios','cars/vios-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/vios-2020.jpg'),
    ('Honda','City','cars/city-rs-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/city-rs-2021.jpg'),
    ('Mazda','CX-5','cars/cx5-2019.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/cx5-2019.jpg'),
    ('Hyundai','Accent','cars/accent-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/accent-2020.png'),
    ('Kia','Seltos','cars/seltos-2022.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/seltos-2022.webp'),
    ('Ford','Ranger','cars/ranger-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/ranger-2021.webp'),
    ('VinFast','Lux A2.0','cars/luxa20-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/luxa20-2020.jpg'),
    ('Mercedes','C300 AMG','cars/c300amg-2018.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/c300amg-2018.webp'),
    ('Mitsubishi','Xpander','cars/xpander-2021.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/xpander-2021.avif'),
    ('Peugeot','3008','cars/peugeot3008-2020.png','https://ybhdhpmledyxuzdrrnzp.supabase.co/storage/v1/object/public/cars/peugeot3008-2020.webp')
  ) AS t(brand, model, file_key, public_url)
)
INSERT INTO listing_images (listing_id, file_key, public_url, position)
SELECT l.id, i.file_key, i.public_url, 0
FROM listings l
JOIN imgs i ON l.brand=i.brand AND l.model=i.model
ON CONFLICT DO NOTHING;

INSERT INTO provinces (id, name) VALUES
(1,'Hà Nội'),
(2,'Hồ Chí Minh'),
(3,'Hải Phòng'),
(4,'Đà Nẵng'),
(5,'Cần Thơ'),
(6,'Hà Giang'),
(7,'Cao Bằng'),
(8,'Lai Châu'),
(9,'Lào Cai'),
(10,'Tuyên Quang'),
(11,'Lạng Sơn'),
(12,'Bắc Kạn'),
(13,'Thái Nguyên'),
(14,'Yên Bái'),
(15,'Sơn La'),
(16,'Phú Thọ'),
(17,'Vĩnh Phúc'),
(18,'Quảng Ninh'),
(19,'Bắc Giang'),
(20,'Bắc Ninh'),
(21,'Hải Dương'),
(22,'Hưng Yên'),
(23,'Hòa Bình'),
(24,'Hà Nam'),
(25,'Nam Định'),
(26,'Thái Bình'),
(27,'Ninh Bình'),
(28,'Thanh Hóa'),
(29,'Nghệ An'),
(30,'Hà Tĩnh'),
(31,'Quảng Bình'),
(32,'Quảng Trị'),
(33,'Thừa Thiên Huế'),
(34,'Quảng Nam'),
(35,'Quảng Ngãi'),
(36,'Kon Tum'),
(37,'Gia Lai'),
(38,'Đắk Lắk'),
(39,'Đắk Nông'),
(40,'Khánh Hòa'),
(41,'Lâm Đồng'),
(42,'Ninh Thuận'),
(43,'Bình Thuận'),
(44,'Phú Yên'),
(45,'Bình Định'),
(46,'Bình Dương'),
(47,'Bình Phước'),
(48,'Tây Ninh'),
(49,'Đồng Nai'),
(50,'Bà Rịa - Vũng Tàu'),
(51,'Long An'),
(52,'Tiền Giang'),
(53,'Bến Tre'),
(54,'Trà Vinh'),
(55,'Vĩnh Long'),
(56,'Đồng Tháp'),
(57,'An Giang'),
(58,'Kiên Giang'),
(59,'Hậu Giang'),
(60,'Sóc Trăng'),
(61,'Bạc Liêu'),
(62,'Cà Mau'),
(63,'Quảng Bình'); -- nếu bạn đã có 63 trước đó, đảm bảo không trùng

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

-- ✅ KẾT THÚC SEED
