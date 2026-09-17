PRAGMA foreign_keys = ON;

-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CATEGORY FIELDS
-- ==========================================

CREATE TABLE IF NOT EXISTS category_fields (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text',
    required INTEGER NOT NULL DEFAULT 0,
    options TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE,

    UNIQUE(category_id, field_key)
);

-- ==========================================
-- PRODUCTS
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    product_code TEXT UNIQUE,
    description TEXT,
    manufacturer_name TEXT,
    origin_source TEXT,
    production_location TEXT,
    product_type TEXT,
    production_date TEXT,
    lot_number TEXT,
    expiry_date TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

-- ==========================================
-- PRODUCT VALUES
-- ==========================================

CREATE TABLE IF NOT EXISTS product_values (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    value TEXT,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    FOREIGN KEY (field_id)
        REFERENCES category_fields(id)
        ON DELETE CASCADE,

    UNIQUE(product_id, field_id)
);

-- ==========================================
-- QR CODES
-- ==========================================

CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- ==========================================
-- SCAN LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS scan_logs (
    id TEXT PRIMARY KEY,
    qr_code_id TEXT,
    product_id TEXT,
    scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,

    FOREIGN KEY (qr_code_id)
        REFERENCES qr_codes(id)
        ON DELETE SET NULL,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_status
ON products(status);

CREATE INDEX IF NOT EXISTS idx_product_values_product
ON product_values(product_id);

CREATE INDEX IF NOT EXISTS idx_product_values_field
ON product_values(field_id);

CREATE INDEX IF NOT EXISTS idx_qr_token
ON qr_codes(token);

CREATE INDEX IF NOT EXISTS idx_qr_product
ON qr_codes(product_id);

CREATE INDEX IF NOT EXISTS idx_scan_product
ON scan_logs(product_id);

CREATE INDEX IF NOT EXISTS idx_scan_date
ON scan_logs(scanned_at);
