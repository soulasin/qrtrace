import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  QrCode,
  ScanLine,
  LogOut,
  User
} from 'lucide-react'

const menu = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: 'Products',
    path: '/admin/products',
    icon: Package,
  },
  {
    name: 'Categories',
    path: '/admin/categories',
    icon: Tags,
  },
  {
    name: 'QR Codes',
    path: '/admin/qr-codes',
    icon: QrCode,
  },
  {
    name: 'Scan Logs',
    path: '/admin/scan-logs',
    icon: ScanLine,
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('qrtrace_auth')
    navigate('/login', { replace: true })
  }

  let auth = null

  try {
    auth = JSON.parse(localStorage.getItem('qrtrace_auth'))
  } catch {
    auth = null
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 text-white flex flex-col">

        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold">
            QR
          </div>

          <div className="ml-3">
            <div className="font-bold text-lg">
              QRTrace
            </div>

            <div className="text-xs text-slate-400">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">

          {menu.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            )
          })}

        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">

          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={18} />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {auth?.username || 'Admin'}
              </div>

              <div className="text-xs text-slate-400">
                Administrator
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>


      {/* Main */}
      <div className="ml-64 min-h-screen">

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              QRTrace Admin
            </h1>

            <p className="text-sm text-slate-500">
              Manage products and QR codes
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Local Development
          </div>

        </header>

        {/* Page */}
        <main className="p-8">
          <Outlet />
        </main>

      </div>

    </div>
  )
}
