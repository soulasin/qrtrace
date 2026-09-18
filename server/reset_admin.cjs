const db = require('./db.cjs')
const bcrypt = require('bcryptjs')

const password = process.env.ADMIN_PASSWORD

if (!password) {
  throw new Error('ADMIN_PASSWORD is required')
}

const admin = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get('admin')

if (!admin) {
  throw new Error('Admin user not found')
}

const passwordHash = bcrypt.hashSync(password, 12)

db.prepare(`
  UPDATE users
  SET password_hash = ?
  WHERE username = ?
`).run(passwordHash, 'admin')

console.log('Admin password reset successfully')
