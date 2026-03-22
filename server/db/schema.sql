-- ============================================================
-- 3xMedia — PostgreSQL Schema
-- ============================================================

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  pin_hash     VARCHAR(255),
  role         VARCHAR(50) NOT NULL DEFAULT 'warehouse',
  -- roles: admin | warehouse | location | kpp | renter
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Refresh токены
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Push подписки
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Склад
-- ============================================================

CREATE TABLE IF NOT EXISTS items (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(50) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100),
  status       VARCHAR(50) DEFAULT 'available',
  -- available | issued | reserved | repair
  condition    VARCHAR(50),
  value        INTEGER,
  tags         TEXT[],
  origin       VARCHAR(100),
  unique_marks TEXT,
  warehouse    VARCHAR(100),
  cell         VARCHAR(50),
  photo_count  INTEGER DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issuances (
  id               SERIAL PRIMARY KEY,
  item_id          INTEGER REFERENCES items(id),
  issued_to_name   VARCHAR(255),
  issued_to_user   INTEGER REFERENCES users(id),
  role             VARCHAR(100),
  phone            VARCHAR(50),
  project          VARCHAR(255),
  block            VARCHAR(100),
  return_date      DATE,
  issued_at        TIMESTAMP DEFAULT NOW(),
  returned_at      TIMESTAMP,
  issued_by              INTEGER REFERENCES users(id),
  returned_by            INTEGER REFERENCES users(id),
  issue_signature        TEXT,   -- base64 canvas (кладовщик)
  receipt_confirmed_at   TIMESTAMP,
  receipt_signature      TEXT,   -- base64 canvas (получатель)
  return_signature       TEXT,
  notes                  TEXT
);

-- ============================================================
-- Транспорт
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id               SERIAL PRIMARY KEY,
  code             VARCHAR(50) UNIQUE NOT NULL,
  name             VARCHAR(255) NOT NULL,
  subtitle         VARCHAR(255),
  owner_name       VARCHAR(255),
  owner_phone      VARCHAR(50),
  price_per_day    INTEGER,
  gearbox          VARCHAR(50),
  driver_included  BOOLEAN DEFAULT false,
  limits           TEXT,
  history          TEXT[],
  photo_count      INTEGER DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Площадки
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  subtitle      VARCHAR(255),
  address       TEXT,
  owner_name    VARCHAR(255),
  owner_phone   VARCHAR(50),
  price_per_day INTEGER,
  access_hours  VARCHAR(100),
  ceiling_height DECIMAL(4,1),
  style         TEXT,
  limits        TEXT,
  inventory     TEXT,
  history       TEXT[],
  photo_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS location_requests (
  id           SERIAL PRIMARY KEY,
  location_id  INTEGER REFERENCES locations(id),
  requested_by INTEGER REFERENCES users(id),
  project      VARCHAR(255),
  shoot_date   DATE,
  status       VARCHAR(50) DEFAULT 'pending',
  -- pending | confirmed | rejected
  notes        TEXT,
  confirmed_by INTEGER REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Запросы на выдачу со склада
CREATE TABLE IF NOT EXISTS warehouse_requests (
  id               SERIAL PRIMARY KEY,
  item_id          INTEGER REFERENCES items(id),
  item_name_free   VARCHAR(255),  -- если предмета ещё нет в БД
  requested_by     INTEGER REFERENCES users(id),
  project          VARCHAR(255),
  scene            VARCHAR(100),
  needed_by        DATE,
  status           VARCHAR(50) DEFAULT 'new',
  -- new | confirmed | rejected | issued
  issuance_id      INTEGER REFERENCES issuances(id),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wreq_status ON warehouse_requests(status);

-- ============================================================
-- КПП
-- ============================================================

CREATE TABLE IF NOT EXISTS kpp_files (
  id           SERIAL PRIMARY KEY,
  filename     VARCHAR(255),
  storage_key  VARCHAR(500),
  parsed_data  JSONB,
  role_notes   JSONB,
  uploaded_by  INTEGER REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Аренда
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id          SERIAL PRIMARY KEY,
  ref_type    VARCHAR(50) NOT NULL,  -- vehicle | location | partner
  ref_id      INTEGER NOT NULL,
  project     VARCHAR(255),
  start_date  DATE,
  end_date    DATE,
  total_price INTEGER,
  status      VARCHAR(50) DEFAULT 'draft',
  -- draft | signed | active | completed
  pdf_key     VARCHAR(500),
  signature   TEXT,
  signed_by   INTEGER REFERENCES users(id),
  signed_at   TIMESTAMP,
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Фото
-- ============================================================

CREATE TABLE IF NOT EXISTS photos (
  id          SERIAL PRIMARY KEY,
  ref_type    VARCHAR(50) NOT NULL,  -- item | vehicle | location | contract
  ref_id      INTEGER NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  url         VARCHAR(500),
  size_bytes  INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Вызывные листы
-- ============================================================

CREATE TABLE IF NOT EXISTS callsheets (
  id          SERIAL PRIMARY KEY,
  project     VARCHAR(255),
  shoot_date  DATE,
  location_id INTEGER REFERENCES locations(id),
  content     JSONB,
  pdf_key     VARCHAR(500),
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Уведомления
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255),
  body       TEXT,
  type       VARCHAR(50),
  ref_type   VARCHAR(50),
  ref_id     INTEGER,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Индексы
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_items_status    ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_code      ON items(code);
CREATE INDEX IF NOT EXISTS idx_issuances_item  ON issuances(item_id);
CREATE INDEX IF NOT EXISTS idx_photos_ref      ON photos(ref_type, ref_id);
CREATE INDEX IF NOT EXISTS idx_notif_user      ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_refresh_token   ON refresh_tokens(token_hash);
