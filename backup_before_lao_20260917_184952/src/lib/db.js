const STORAGE_KEY = 'qrtrace_database'

const defaultData = {
  categories: [
    {
      id: crypto.randomUUID(),
      name: 'Agriculture',
      description: 'Agricultural and farming products',
      fields: [
        {
          id: crypto.randomUUID(),
          name: 'farmName',
          label: 'Farm Name',
          type: 'text',
          required: true,
        },
        {
          id: crypto.randomUUID(),
          name: 'province',
          label: 'Province',
          type: 'text',
          required: true,
        },
        {
          id: crypto.randomUUID(),
          name: 'cropType',
          label: 'Crop Type',
          type: 'text',
          required: false,
        },
        {
          id: crypto.randomUUID(),
          name: 'harvestDate',
          label: 'Harvest Date',
          type: 'date',
          required: false,
        },
        {
          id: crypto.randomUUID(),
          name: 'batchNumber',
          label: 'Batch Number',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Factory',
      description: 'Manufactured and industrial products',
      fields: [
        {
          id: crypto.randomUUID(),
          name: 'factoryName',
          label: 'Factory Name',
          type: 'text',
          required: true,
        },
        {
          id: crypto.randomUUID(),
          name: 'productionLine',
          label: 'Production Line',
          type: 'text',
          required: false,
        },
        {
          id: crypto.randomUUID(),
          name: 'productionDate',
          label: 'Production Date',
          type: 'date',
          required: false,
        },
        {
          id: crypto.randomUUID(),
          name: 'material',
          label: 'Material',
          type: 'text',
          required: false,
        },
        {
          id: crypto.randomUUID(),
          name: 'qualityGrade',
          label: 'Quality Grade',
          type: 'text',
          required: false,
        },
      ],
    },
  ],

  products: [],

  scans: [],
}

function loadDatabase() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return defaultData
  }

  try {
    return JSON.parse(saved)
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return defaultData
  }
}

function saveDatabase(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

export function getDatabase() {
  return loadDatabase()
}

export function getCategories() {
  return loadDatabase().categories
}

export function getProducts() {
  return loadDatabase().products
}

export function getProductByToken(token) {
  return loadDatabase().products.find(
    (product) => product.qrToken === token
  )
}

export function addCategory(category) {
  const db = loadDatabase()

  const newCategory = {
    id: crypto.randomUUID(),
    name: category.name,
    description: category.description || '',
    fields: category.fields || [],
  }

  db.categories.push(newCategory)

  saveDatabase(db)

  return newCategory
}

export function deleteCategory(id) {
  const db = loadDatabase()

  db.categories = db.categories.filter(
    (category) => category.id !== id
  )

  saveDatabase(db)
}

export function addProduct(product) {
  const db = loadDatabase()

  const newProduct = {
    id: crypto.randomUUID(),
    qrToken: crypto.randomUUID().replaceAll('-', ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    ...product,
  }

  db.products.push(newProduct)

  saveDatabase(db)

  return newProduct
}

export function updateProduct(id, updates) {
  const db = loadDatabase()

  const index = db.products.findIndex(
    (product) => product.id === id
  )

  if (index === -1) {
    return null
  }

  db.products[index] = {
    ...db.products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDatabase(db)

  return db.products[index]
}

export function deleteProduct(id) {
  const db = loadDatabase()

  db.products = db.products.filter(
    (product) => product.id !== id
  )

  db.scans = db.scans.filter(
    (scan) => scan.productId !== id
  )

  saveDatabase(db)
}

export function addScan(productId) {
  const db = loadDatabase()

  const scan = {
    id: crypto.randomUUID(),
    productId,
    scannedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }

  db.scans.push(scan)

  saveDatabase(db)

  return scan
}

export function getScans() {
  return loadDatabase().scans
}

export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}
