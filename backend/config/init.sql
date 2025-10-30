-- db/init.sql
-- Khởi tạo DB cho Autorizz (mua/bán ô tô)
-- Bao phủ: Quản lý bài đăng, quản trị người dùng, yêu thích, so sánh, báo cáo vi phạm,
-- kiểm duyệt/duyệt bài, theo dõi hoạt động (audit), thống kê về sau.

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;           -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";        -- (tuỳ chọn) uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS citext;             -- cho CITEXT (case-insensitive email)

-- 1) ENUM types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active','locked','inactive');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('draft','pending','approved','rejected','sold');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
    CREATE TYPE report_type AS ENUM (
      'fraud',
      'unreachable',
      'wrong_price',
      'duplicate',
      'sold',
      'incorrect_info',
      'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE report_status AS ENUM ('new','reviewing','accepted','rejected','dismissed');
  END IF;
END$$;

-- 2) Helper: tự động cập nhật updated_at trên UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) USERS
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT,
  phone           TEXT,
  address         TEXT,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  status          user_status NOT NULL DEFAULT 'active',
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) LISTINGS (bài đăng)
-- 4.1) PROVINCES (Tỉnh/Thành)
CREATE TABLE IF NOT EXISTS provinces (
  id   SMALLINT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE
);

-- 4.2) DISTRICTS (Quận/Huyện)
CREATE TABLE IF NOT EXISTS districts (
  id          INTEGER PRIMARY KEY,
  province_id SMALLINT NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
  name        TEXT NOT NULL,
  slug        TEXT,
  UNIQUE (province_id, name)
);
CREATE INDEX IF NOT EXISTS idx_districts_province ON districts(province_id);

-- 4.3) Bảng chứa Hãng xe (VD: Hyundai, Toyota, Ford)
CREATE TABLE IF NOT EXISTS brands (
  id              SERIAL PRIMARY KEY, -- Dùng SERIAL (số tự tăng) cho đơn giản
  name            TEXT NOT NULL UNIQUE -- Tên hãng xe phải là duy nhất
);

-- 4.4) Bảng chứa Dòng xe (VD: Veloster, Santa Fe, Civic)
CREATE TABLE IF NOT EXISTS models (
  id              SERIAL PRIMARY KEY,
  brand_id        INT NOT NULL REFERENCES brands(id) ON DELETE CASCADE, -- Liên kết tới Bảng Hãng xe
  name            TEXT NOT NULL,
  
  -- Đảm bảo một hãng xe không thể có 2 dòng xe trùng tên
  UNIQUE(brand_id, name),
  UNIQUE(id, brand_id)
);
CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  price_vnd       BIGINT NOT NULL CHECK (price_vnd > 0),
  brand_id        INT NOT NULL,
  model_id        INT NOT NULL REFERENCES models(id),  
  year            INT  NOT NULL CHECK (year BETWEEN 1900 AND (EXTRACT(YEAR FROM CURRENT_DATE))::INT + 1),
  mileage_km      INT,
  gearbox         TEXT,     
  fuel            TEXT,     -- xăng | dầu | hybrid | ev ...
  body_type       TEXT,     -- sedan | suv | ...
  seats           SMALLINT,
  color_ext       CHAR(7) CHECK (color_ext ~ '^#([0-9A-Fa-f]{6})$'),
  color_int       CHAR(7) CHECK (color_int ~ '^#([0-9A-Fa-f]{6})$'),
  origin          TEXT,     -- nhập khẩu | trong nước | ...
  description     TEXT,
  status          listing_status NOT NULL DEFAULT 'pending',
  -- Địa chỉ chuẩn hoá
  province_id      SMALLINT  REFERENCES provinces(id),
  district_id      INTEGER   REFERENCES districts(id),
  address_line     TEXT,    
 -- Text gộp để hiển thị & search tự do (tự cập nhật bằng trigger)
  location_text   TEXT,     
  video_url       TEXT,
  views_count     INT NOT NULL DEFAULT 0,
  edits_count     INT NOT NULL DEFAULT 0,   -- phục vụ đánh giá hoạt động chỉnh sửa
  reports_count   INT NOT NULL DEFAULT 0,
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (model_id, brand_id) REFERENCES models (id, brand_id)
);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price_vnd);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand_id);
CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_region ON listings(province_id, district_id);
CREATE TRIGGER trg_listings_updated
BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Ràng buộc quận thuộc đúng tỉnh
CREATE OR REPLACE FUNCTION check_listing_location()
RETURNS TRIGGER AS $$
DECLARE
  d_province SMALLINT;
BEGIN
  IF NEW.district_id IS NOT NULL THEN
    SELECT province_id INTO d_province FROM districts WHERE id = NEW.district_id;
    IF d_province IS NULL OR (NEW.province_id IS NOT NULL AND NEW.province_id <> d_province) THEN
      RAISE EXCEPTION 'district_id % không thuộc province_id %', NEW.district_id, NEW.province_id;
    END IF;
    NEW.province_id := COALESCE(NEW.province_id, d_province);
  END IF;

  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_location ON listings;
CREATE TRIGGER trg_listings_location
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION check_listing_location();

-- Tự build location_text từ province/district
CREATE OR REPLACE FUNCTION build_location_text()
RETURNS TRIGGER AS $$
DECLARE
  p TEXT; d TEXT;
BEGIN
  SELECT name INTO p FROM provinces WHERE id = NEW.province_id;
  SELECT name INTO d FROM districts WHERE id = NEW.district_id;

  NEW.location_text :=
    TRIM(BOTH ' ' FROM CONCAT_WS(' - ', NULLIF(p,''), NULLIF(d,'')));

  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_location_text ON listings;
CREATE TRIGGER trg_listings_location_text
BEFORE INSERT OR UPDATE OF province_id, district_id ON listings
FOR EACH ROW EXECUTE FUNCTION build_location_text();

-- 5) IMAGES (ảnh bài đăng)
CREATE TABLE IF NOT EXISTS listing_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  file_key    TEXT NOT NULL,   -- đường dẫn trong bucket Supabase
  public_url  TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_images_listing ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_images_position ON listing_images(listing_id, position);

-- 6) FAVORITES (yêu thích)
CREATE TABLE IF NOT EXISTS favorites (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_listing ON favorites(listing_id);

-- 7) COMPARISONS (so sánh 2 bài)
CREATE TABLE IF NOT EXISTS comparisons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  left_listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  right_listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_diff_listings CHECK (left_listing_id <> right_listing_id),
  CONSTRAINT uniq_pair UNIQUE (user_id, left_listing_id, right_listing_id)
);

-- 8) REPORTS (báo cáo vi phạm)
CREATE TABLE IF NOT EXISTS reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id   UUID REFERENCES users(id) ON DELETE SET NULL, -- có thể NULl khi ẩn danh
  reporter_phone TEXT, -- dùng khi báo cáo ẩn danh
  type          report_type NOT NULL DEFAULT 'other',
  note          TEXT,
  status        report_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Trigger cộng dồn reports_count
CREATE OR REPLACE FUNCTION bump_reports_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET reports_count = reports_count + 1 WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET reports_count = GREATEST(reports_count - 1, 0) WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_counter_ins ON reports;
CREATE TRIGGER trg_reports_counter_ins
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION bump_reports_count();

DROP TRIGGER IF EXISTS trg_reports_counter_del ON reports;
CREATE TRIGGER trg_reports_counter_del
AFTER DELETE ON reports
FOR EACH ROW EXECUTE FUNCTION bump_reports_count();

-- 9) AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  target_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Tăng edits_count
CREATE OR REPLACE FUNCTION inc_edits_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.price_vnd IS DISTINCT FROM OLD.price_vnd
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.brand_id IS DISTINCT FROM OLD.brand_id
     OR NEW.model_id IS DISTINCT FROM OLD.model_id
     OR NEW.year IS DISTINCT FROM OLD.year
     OR NEW.mileage_km IS DISTINCT FROM OLD.mileage_km
     OR NEW.gearbox IS DISTINCT FROM OLD.gearbox
     OR NEW.fuel IS DISTINCT FROM OLD.fuel
     OR NEW.body_type IS DISTINCT FROM OLD.body_type
     OR NEW.seats IS DISTINCT FROM OLD.seats
     OR NEW.location_text IS DISTINCT FROM OLD.location_text
  THEN
    NEW.edits_count := OLD.edits_count + 1;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_editcount ON listings;
CREATE TRIGGER trg_listings_editcount
BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION inc_edits_count();

-- 11) Chỉ mục thống kê (comment tạm dev để tránh IMMUTABLE error, thêm sau nếu cần)
-- CREATE INDEX IF NOT EXISTS idx_listings_created_day ON listings ((created_at::date));
-- CREATE INDEX IF NOT EXISTS idx_reports_created_day ON reports ((created_at::date));
-- CREATE INDEX IF NOT EXISTS idx_audit_created_day ON audit_logs ((created_at::date));



-- Kết thúc init.sql