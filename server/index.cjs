require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const db = require('./db.cjs')
const { requireAuth, JWT_SECRET } = require('./middleware/auth.cjs')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '2mb' }))

// ==========================================
// Health
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'QRTrace API',
    database: 'SQLite',
    status: 'ok'
  })
})

// ==========================================
// AUTH
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    })
  }

  const user = db
    .prepare(`
      SELECT *
      FROM users
      WHERE username = ?
      AND status = 'active'
    `)
    .get(username)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    })
  }

  const valid = bcrypt.compareSync(
    password,
    user.password_hash
  )

  if (!valid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    })
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '8h'
    }
  )

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  })
})

// ==========================================
// CATEGORIES
// ==========================================

app.get('/api/categories', requireAuth, (req, res) => {
  const categories = db
    .prepare(`
      SELECT *
      FROM categories
      ORDER BY created_at DESC
    `)
    .all()

  const fields = db
    .prepare(`
      SELECT *
      FROM category_fields
      ORDER BY sort_order ASC
    `)
    .all()

  const result = categories.map(category => ({
    ...category,
    fields: fields
      .filter(field => field.category_id === category.id)
      .map(field => ({
        ...field,
        required: Boolean(field.required),
        options: field.options
          ? JSON.parse(field.options)
          : []
      }))
  }))

  res.json({
    success: true,
    data: result
  })
})

app.get('/api/categories/:id', requireAuth, (req, res) => {
  const category = db
    .prepare(`
      SELECT *
      FROM categories
      WHERE id = ?
    `)
    .get(req.params.id)

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    })
  }

  const fields = db
    .prepare(`
      SELECT *
      FROM category_fields
      WHERE category_id = ?
      ORDER BY sort_order ASC
    `)
    .all(req.params.id)
    .map(field => ({
      ...field,
      required: Boolean(field.required),
      options: field.options
        ? JSON.parse(field.options)
        : []
    }))

  res.json({
    success: true,
    data: {
      ...category,
      fields
    }
  })
})

app.post('/api/categories', requireAuth, (req, res) => {
  const {
    name,
    description = '',
    fields = []
  } = req.body

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required'
    })
  }

  const categoryId = uuidv4()

  const insertCategory = db.prepare(`
    INSERT INTO categories (
      id,
      name,
      description
    )
    VALUES (?, ?, ?)
  `)

  const insertField = db.prepare(`
    INSERT INTO category_fields (
      id,
      category_id,
      field_key,
      field_label,
      field_type,
      required,
      options,
      sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    insertCategory.run(
      categoryId,
      name,
      description
    )

    fields.forEach((field, index) => {
      insertField.run(
        uuidv4(),
        categoryId,
        field.key,
        field.label,
        field.type || 'text',
        field.required ? 1 : 0,
        field.options
          ? JSON.stringify(field.options)
          : null,
        index
      )
    })
  })

  transaction()

  res.status(201).json({
    success: true,
    data: {
      id: categoryId
    }
  })
})

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  const product = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE category_id = ?
    `)
    .get(req.params.id)

  if (product.count > 0) {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete category containing products'
    })
  }

  const result = db
    .prepare(`
      DELETE FROM categories
      WHERE id = ?
    `)
    .run(req.params.id)

  res.json({
    success: result.changes > 0
  })
})

// ==========================================
// PRODUCTS
// ==========================================

function generateProductCode() {
  // Product codes are system identifiers, not translated labels.  Keeping the
  // prefix ASCII makes them easy to type, print and scan regardless of the
  // language used for the product or category name.
  const prefix = 'PRD'
  const codes = db
    .prepare(`
      SELECT product_code
      FROM products
      WHERE product_code LIKE ?
    `)
    .all(`${prefix}-%`)

  const largestNumber = codes.reduce((largest, item) => {
    const match = String(item.product_code).match(/-(\d+)$/)
    return match ? Math.max(largest, Number(match[1])) : largest
  }, 0)

  return `${prefix}-${String(largestNumber + 1).padStart(6, '0')}`
}

function getProduct(productId) {
  const product = db
    .prepare(`
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      WHERE p.id = ?
    `)
    .get(productId)

  if (!product) return null

  if (!product.product_code) {
    const generatedCode = generateProductCode()

    db.prepare(`
      UPDATE products
      SET product_code = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND product_code IS NULL
    `).run(generatedCode, productId)

    product.product_code = generatedCode
  }

  const fields = db
    .prepare(`
      SELECT
        cf.id,
        cf.field_key,
        cf.field_label,
        cf.field_type,
        cf.required,
        cf.options,
        pv.value
      FROM category_fields cf
      LEFT JOIN product_values pv
        ON pv.field_id = cf.id
        AND pv.product_id = ?
      WHERE cf.category_id = ?
      ORDER BY cf.sort_order ASC
    `)
    .all(productId, product.category_id)

  const resolvedFields = fields.map(field => {
    let val = field.value
    if (val === null || val === undefined || val === '') {
      val = product[field.field_key] || ''
    }
    return {
      ...field,
      value: val,
      required: Boolean(field.required),
      options: field.options
        ? JSON.parse(field.options)
        : []
    }
  })

  const attributesMap = {
    manufacturer_name: product.manufacturer_name || '',
    origin_source: product.origin_source || '',
    production_location: product.production_location || '',
    product_type: product.product_type || '',
    production_date: product.production_date || '',
    lot_number: product.lot_number || '',
    expiry_date: product.expiry_date || '',
  }

  resolvedFields.forEach(f => {
    if (f.field_key) {
      attributesMap[f.field_key] = f.value || attributesMap[f.field_key] || ''
    }
  })

  const qr = db
    .prepare(`
      SELECT *
      FROM qr_codes
      WHERE product_id = ?
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(productId)

  return {
    ...product,
    manufacturer_name: attributesMap.manufacturer_name,
    origin_source: attributesMap.origin_source,
    production_location: attributesMap.production_location,
    product_type: attributesMap.product_type,
    production_date: attributesMap.production_date,
    lot_number: attributesMap.lot_number,
    expiry_date: attributesMap.expiry_date,
    fields: resolvedFields,
    attributes: attributesMap,
    qr: qr || null
  }
}

app.get('/api/products', requireAuth, (req, res) => {
  const products = db
    .prepare(`
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `)
    .all()

  res.json({
    success: true,
    data: products.map(product => getProduct(product.id))
  })
})

app.get('/api/products/:id', requireAuth, (req, res) => {
  const product = getProduct(req.params.id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    })
  }

  res.json({
    success: true,
    data: product
  })
})

app.post('/api/products', requireAuth, (req, res) => {
  const {
    categoryId,
    name,
    productCode: inputCode,
    description = '',
    attributes = {}
  } = req.body

  if (!categoryId || !name) {
    return res.status(400).json({
      success: false,
      message: 'Category and product name are required'
    })
  }

  const category = db
    .prepare(`
      SELECT *
      FROM categories
      WHERE id = ?
    `)
    .get(categoryId)

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    })
  }

  const manufacturerName = req.body.manufacturerName || req.body.manufacturer_name || attributes.manufacturer_name || attributes.manufacturerName || ''
  const originSource = req.body.originSource || req.body.origin_source || attributes.origin_source || attributes.originSource || ''
  const productionLocation = req.body.productionLocation || req.body.production_location || attributes.production_location || attributes.productionLocation || ''
  const productType = req.body.productType || req.body.product_type || attributes.product_type || attributes.productType || ''
  const productionDate = req.body.productionDate || req.body.production_date || attributes.production_date || attributes.productionDate || null
  const lotNumber = req.body.lotNumber || req.body.lot_number || attributes.lot_number || attributes.lotNumber || ''
  const expiryDate = req.body.expiryDate || req.body.expiry_date || attributes.expiry_date || attributes.expiryDate || null

  const productId = uuidv4()
  const productCode = (inputCode && String(inputCode).trim())
    ? String(inputCode).trim()
    : generateProductCode()

  const existingCode = db.prepare('SELECT id FROM products WHERE product_code = ?').get(productCode)
  if (existingCode) {
    return res.status(409).json({
      success: false,
      message: `ລະຫັດສິນຄ້າ "${productCode}" ມີໃນລະບົບແລ້ວ`
    })
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id,
      category_id,
      name,
      product_code,
      description,
      manufacturer_name,
      origin_source,
      production_location,
      product_type,
      production_date,
      lot_number,
      expiry_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertValue = db.prepare(`
    INSERT INTO product_values (
      id,
      product_id,
      field_id,
      value
    )
    VALUES (?, ?, ?, ?)
  `)

  const fields = db
    .prepare(`
      SELECT *
      FROM category_fields
      WHERE category_id = ?
      ORDER BY sort_order
    `)
    .all(categoryId)

  const transaction = db.transaction(() => {
    insertProduct.run(
      productId,
      categoryId,
      name,
      productCode,
      description,
      manufacturerName,
      originSource,
      productionLocation,
      productType,
      productionDate,
      lotNumber,
      expiryDate
    )

    fields.forEach(field => {
      let value = attributes[field.field_key] || req.body[field.field_key]
      if ((value === undefined || value === null) && field.field_key === 'manufacturer_name') value = manufacturerName
      if ((value === undefined || value === null) && field.field_key === 'origin_source') value = originSource
      if ((value === undefined || value === null) && field.field_key === 'production_location') value = productionLocation
      if ((value === undefined || value === null) && field.field_key === 'product_type') value = productType
      if ((value === undefined || value === null) && field.field_key === 'production_date') value = productionDate
      if ((value === undefined || value === null) && field.field_key === 'lot_number') value = lotNumber
      if ((value === undefined || value === null) && field.field_key === 'expiry_date') value = expiryDate

      if (value !== undefined && value !== null) {
        insertValue.run(
          uuidv4(),
          productId,
          field.id,
          String(value)
        )
      }
    })
  })

  transaction()

  res.status(201).json({
    success: true,
    data: getProduct(productId)
  })
})

app.put('/api/products/:id', requireAuth, (req, res) => {
  const existing = db
    .prepare(`
      SELECT *
      FROM products
      WHERE id = ?
    `)
    .get(req.params.id)

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    })
  }

  const attrs = req.body.attributes || {}
  const manufacturerName = req.body.manufacturerName || req.body.manufacturer_name || attrs.manufacturer_name || attrs.manufacturerName || existing.manufacturer_name || ''
  const originSource = req.body.originSource || req.body.origin_source || attrs.origin_source || attrs.originSource || existing.origin_source || ''
  const productionLocation = req.body.productionLocation || req.body.production_location || attrs.production_location || attrs.productionLocation || existing.production_location || ''
  const productType = req.body.productType || req.body.product_type || attrs.product_type || attrs.productType || existing.product_type || ''
  const productionDate = req.body.productionDate || req.body.production_date || attrs.production_date || attrs.productionDate || existing.production_date || null
  const lotNumber = req.body.lotNumber || req.body.lot_number || attrs.lot_number || attrs.lotNumber || existing.lot_number || ''
  const expiryDate = req.body.expiryDate || req.body.expiry_date || attrs.expiry_date || attrs.expiryDate || existing.expiry_date || null
  const status = req.body.status || existing.status

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId)
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    })
  }

  const resolvedProductCode = (productCode && String(productCode).trim())
    ? String(productCode).trim()
    : existing.product_code

  const existingCode = db.prepare('SELECT id FROM products WHERE product_code = ? AND id != ?').get(resolvedProductCode, req.params.id)
  if (existingCode) {
    return res.status(409).json({
      success: false,
      message: `ລະຫັດສິນຄ້າ "${resolvedProductCode}" ມີໃນລະບົບແລ້ວ`
    })
  }

  const updateProduct = db.prepare(`
    UPDATE products
    SET
      category_id = ?,
      name = ?,
      product_code = ?,
      description = ?,
      manufacturer_name = ?,
      origin_source = ?,
      production_location = ?,
      product_type = ?,
      production_date = ?,
      lot_number = ?,
      expiry_date = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)

  const deleteValues = db.prepare(`
    DELETE FROM product_values
    WHERE product_id = ?
  `)

  const insertValue = db.prepare(`
    INSERT INTO product_values (
      id,
      product_id,
      field_id,
      value
    )
    VALUES (?, ?, ?, ?)
  `)

  const fields = db
    .prepare(`
      SELECT *
      FROM category_fields
      WHERE category_id = ?
      ORDER BY sort_order
    `)
    .all(categoryId)

  const transaction = db.transaction(() => {
    updateProduct.run(
      categoryId,
      name,
      resolvedProductCode,
      description,
      manufacturerName,
      originSource,
      productionLocation,
      productType,
      productionDate,
      lotNumber,
      expiryDate,
      status,
      req.params.id
    )

    deleteValues.run(req.params.id)

    fields.forEach(field => {
      let value = attrs[field.field_key] || req.body[field.field_key]
      if ((value === undefined || value === null) && field.field_key === 'manufacturer_name') value = manufacturerName
      if ((value === undefined || value === null) && field.field_key === 'origin_source') value = originSource
      if ((value === undefined || value === null) && field.field_key === 'production_location') value = productionLocation
      if ((value === undefined || value === null) && field.field_key === 'product_type') value = productType
      if ((value === undefined || value === null) && field.field_key === 'production_date') value = productionDate
      if ((value === undefined || value === null) && field.field_key === 'lot_number') value = lotNumber
      if ((value === undefined || value === null) && field.field_key === 'expiry_date') value = expiryDate

      if (value !== undefined && value !== null) {
        insertValue.run(
          uuidv4(),
          req.params.id,
          field.id,
          String(value)
        )
      }
    })
  })

  transaction()

  res.json({
    success: true,
    data: getProduct(req.params.id)
  })
})

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const result = db
    .prepare(`
      DELETE FROM products
      WHERE id = ?
    `)
    .run(req.params.id)

  res.json({
    success: result.changes > 0
  })
})

// ==========================================
// QR
// ==========================================

app.post('/api/products/:id/qr', requireAuth, (req, res) => {
  const product = db
    .prepare(`
      SELECT id
      FROM products
      WHERE id = ?
    `)
    .get(req.params.id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    })
  }

  const existing = db
    .prepare(`
      SELECT *
      FROM qr_codes
      WHERE product_id = ?
      AND status = 'active'
      LIMIT 1
    `)
    .get(req.params.id)

  if (existing) {
    return res.json({
      success: true,
      data: existing
    })
  }

  const qr = {
    id: uuidv4(),
    product_id: req.params.id,
    token: uuidv4().replace(/-/g, ''),
    status: 'active'
  }

  db.prepare(`
    INSERT INTO qr_codes (
      id,
      product_id,
      token,
      status
    )
    VALUES (?, ?, ?, ?)
  `).run(
    qr.id,
    qr.product_id,
    qr.token,
    qr.status
  )

  res.status(201).json({
    success: true,
    data: qr
  })
})

app.get('/api/qr/:token', (req, res) => {
  const qr = db
    .prepare(`
      SELECT *
      FROM qr_codes
      WHERE token = ?
      AND status = 'active'
    `)
    .get(req.params.token)

  if (!qr) {
    return res.status(404).json({
      success: false,
      message: 'QR code not found'
    })
  }

  const product = getProduct(qr.product_id)

  res.json({
    success: true,
    data: product
  })
})

// ==========================================
// SCANS
// ==========================================

app.post('/api/scans', (req, res) => {
  const {
    token
  } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'QR token is required'
    })
  }

  const qr = db
    .prepare(`
      SELECT *
      FROM qr_codes
      WHERE token = ?
      AND status = 'active'
    `)
    .get(token)

  if (!qr) {
    return res.status(404).json({
      success: false,
      message: 'QR code not found'
    })
  }

  const id = uuidv4()

  db.prepare(`
    INSERT INTO scan_logs (
      id,
      qr_code_id,
      product_id,
      ip_address,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    qr.id,
    qr.product_id,
    req.ip,
    req.headers['user-agent'] || ''
  )

  res.status(201).json({
    success: true,
    data: {
      id
    }
  })
})

app.get('/api/scans', requireAuth, (req, res) => {
  const scans = db
    .prepare(`
      SELECT
        s.*,
        p.name AS product_name,
        p.product_code,
        q.token
      FROM scan_logs s
      LEFT JOIN products p
        ON p.id = s.product_id
      LEFT JOIN qr_codes q
        ON q.id = s.qr_code_id
      ORDER BY s.scanned_at DESC
    `)
    .all()

  res.json({
    success: true,
    data: scans
  })
})

// ==========================================
// DASHBOARD
// ==========================================

app.get('/api/dashboard', requireAuth, (req, res) => {
  const products = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM products
    `)
    .get().count

  const categories = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM categories
    `)
    .get().count

  const qrCodes = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM qr_codes
      WHERE status = 'active'
    `)
    .get().count

  const scans = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM scan_logs
    `)
    .get().count

  res.json({
    success: true,
    data: {
      products,
      categories,
      qrCodes,
      scans
    }
  })
})

// ==========================================
// 404
// ==========================================

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  })
})

// ==========================================
// START
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('==========================================')
  console.log(' QRTrace API Server')
  console.log('==========================================')
  console.log(` Local:   http://localhost:${PORT}`)
  console.log(` Network: http://0.0.0.0:${PORT}`)
  console.log('')
  console.log(' Database:')
  console.log(' data/qrtrace.db')
  console.log('')
  console.log(' Admin:')
  console.log(' username: admin')
  console.log(' password: admin123')
  console.log('==========================================')
})
