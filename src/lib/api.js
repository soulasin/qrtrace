// ============================================================
// API Client — ทุก request ไปที่ Express server port 4000
// token JWT เก็บใน localStorage key: qrtrace_token
// ============================================================

const BASE = '/api'

function getToken() {
  return localStorage.getItem('qrtrace_token') || ''
}

async function request(method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await res.json()

  if (!res.ok) {
    const err = new Error(json.message || 'Request failed')
    err.status = res.status
    throw err
  }

  return json
}

const get  = (path)        => request('GET',    path)
const post = (path, body)  => request('POST',   path, body)
const put  = (path, body)  => request('PUT',    path, body)
const del  = (path)        => request('DELETE', path)

// ============================================================
// AUTH
// ============================================================

export async function login(username, password) {
  const res = await post('/auth/login', { username, password })
  // เก็บ token และ user info
  localStorage.setItem('qrtrace_token', res.token)
  localStorage.setItem('qrtrace_user', JSON.stringify(res.user))
  return res
}

export function logout() {
  localStorage.removeItem('qrtrace_token')
  localStorage.removeItem('qrtrace_user')
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('qrtrace_user'))
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser())
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard() {
  const res = await get('/dashboard')
  return res.data
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories() {
  const res = await get('/categories')
  return res.data
}

export async function createCategory(data) {
  const res = await post('/categories', data)
  return res.data
}

export async function deleteCategory(id) {
  const res = await del(`/categories/${id}`)
  return res
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts() {
  const res = await get('/products')
  return res.data
}

export async function createProduct(data) {
  const res = await post('/products', data)
  return res.data
}

export async function updateProduct(id, data) {
  const res = await put(`/products/${id}`, data)
  return res.data
}

export async function deleteProduct(id) {
  const res = await del(`/products/${id}`)
  return res
}

// ============================================================
// QR CODES
// ============================================================

export async function generateQR(productId) {
  const res = await post(`/products/${productId}/qr`)
  return res.data
}

// ============================================================
// PUBLIC — ดึง product จาก QR token (ไม่ต้อง auth)
// ============================================================

export async function getProductByToken(token) {
  const res = await get(`/qr/${token}`)
  return res.data
}

// ============================================================
// SCANS
// ============================================================

export async function recordScan(token) {
  const res = await post('/scans', { token })
  return res.data
}

export async function getScans() {
  const res = await get('/scans')
  return res.data
}
