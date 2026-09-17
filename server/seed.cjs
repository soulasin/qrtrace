const db = require('./db.cjs')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

// 1. Ensure admin user exists
const adminExists = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get('admin')

if (!adminExists) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is required to create the admin user')
  }

  const passwordHash = bcrypt.hashSync(adminPassword, 12)

  db.prepare(`
    INSERT INTO users (
      id,
      username,
      password_hash,
      role,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    'admin',
    passwordHash,
    'admin',
    'active'
  )

  console.log('Created admin user: admin')
} else {
  console.log('Admin user already exists')
}

// Reset categories table to seed fresh sample categories
db.prepare('DELETE FROM product_values').run()
db.prepare('DELETE FROM qr_codes').run()
db.prepare('DELETE FROM products').run()
db.prepare('DELETE FROM category_fields').run()
db.prepare('DELETE FROM categories').run()

const agricultureId = uuidv4()
const factoryId = uuidv4()

db.prepare(`
  INSERT INTO categories (id, name, description)
  VALUES (?, ?, ?)
`).run(
  agricultureId,
  'ສິນຄ້າກະສິກຳ',
  'ສິນຄ້າຈາກການກະສິກຳ ແລະ ຟາມ'
)

db.prepare(`
  INSERT INTO categories (id, name, description)
  VALUES (?, ?, ?)
`).run(
  factoryId,
  'ສິນຄ້າໂຮງງານ',
  'ສິນຄ້າແປຮູບຈາກໂຮງງານ'
)

// Seed sample products
const sampleProdId = uuidv4()
db.prepare(`
  INSERT INTO products (
    id, category_id, name, product_code, description,
    manufacturer_name, origin_source, production_location, product_type,
    production_date, lot_number, expiry_date
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  sampleProdId,
  agricultureId,
  'ເຂົ້າຫອມມະລິ ອິນຊີ',
  'PRD-000001',
  'ເຂົ້າຫອມມະລິ ຄຸນນະພາບດີ ຈາກຟາມອິນຊີ',
  'ຟາມກະສິກຳອິນຊີ ສະອາດ',
  'ແຂວງວຽງຈັນ',
  'ເມືອງໂພນໂຮງ',
  'ເຂົ້າຫອມມະລິ',
  '2026-01-15',
  'LOT-202601',
  '2027-01-15'
)

// Generate initial QR code for sample product
db.prepare(`
  INSERT INTO qr_codes (id, product_id, token, status)
  VALUES (?, ?, ?, ?)
`).run(
  uuidv4(),
  sampleProdId,
  'dea8daf1cb534916a0747d18a06359e2',
  'active'
)

console.log('Database successfully re-seeded with standard store categories!')
