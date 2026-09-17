const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')
const dbPath = path.join(dataDir, 'qrtrace.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

const schemaPath = path.join(__dirname, 'schema.sql')
const schema = fs.readFileSync(schemaPath, 'utf8')

db.exec(schema)

// SQLite's CREATE TABLE IF NOT EXISTS does not add new columns to an existing
// database. Keep local installations up to date without requiring a reset.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!columns.some(item => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

ensureColumn('products', 'production_date', 'TEXT')
ensureColumn('products', 'expiry_date', 'TEXT')
ensureColumn('products', 'manufacturer_name', 'TEXT')
ensureColumn('products', 'origin_source', 'TEXT')
ensureColumn('products', 'production_location', 'TEXT')
ensureColumn('products', 'product_type', 'TEXT')
ensureColumn('products', 'lot_number', 'TEXT')

module.exports = db
