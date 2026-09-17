import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/public/Home'
import ProductPage from './pages/public/ProductPage'
import Login from './pages/auth/Login'

import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Categories from './pages/admin/Categories'
import QRCode from './pages/admin/QRCode'
import ScanLogs from './pages/admin/ScanLogs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/p/:token" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin (protected) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/qr-codes" element={<QRCode />} />
            <Route path="/admin/scan-logs" element={<ScanLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}