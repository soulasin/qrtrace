import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/auth/Login'
import Home from './pages/public/Home'
import ProductPage from './pages/public/ProductPage'

import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Categories from './pages/admin/Categories'
import QRCodePage from './pages/admin/QRCode'
import ScanLogs from './pages/admin/ScanLogs'

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/p/:token"
          element={<ProductPage />}
        />


        {/* Protected Admin */}
        <Route element={<ProtectedRoute />}>

          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<Dashboard />} />

            <Route
              path="products"
              element={<Products />}
            />

            <Route
              path="categories"
              element={<Categories />}
            />

            <Route
              path="qr-codes"
              element={<QRCodePage />}
            />

            <Route
              path="scan-logs"
              element={<ScanLogs />}
            />

          </Route>

        </Route>


        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-slate-900">
                  404
                </h1>

                <p className="mt-3 text-slate-500">
                  Page not found
                </p>

                <a
                  href="/"
                  className="inline-block mt-6 px-5 py-3 bg-slate-900 text-white rounded-xl"
                >
                  Back Home
                </a>
              </div>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}
