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
import { logout, getCurrentUser } from '../lib/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      path: '/admin',
      label: 'ແຜງຄວບຄຸມ',
      icon: LayoutDashboard,
      end: true
    },
    {
      path: '/admin/products',
      label: 'ສິນຄ້າ',
      icon: Package
    },
    {
      path: '/admin/categories',
      label: 'ໝວດໝູ່',
      icon: Tags
    },
    {
      path: '/admin/qr-codes',
      label: 'QR Code',
      icon: QrCode
    },
    {
      path: '/admin/scan-logs',
      label: 'ປະຫວັດການສະແກນ',
      icon: ScanLine
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <div className="font-bold text-lg">QRTrace</div>
                <div className="text-xs text-slate-400">
                  ລະບົບຕິດຕາມສິນຄ້າ
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? 'bg-white text-slate-900'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>

              <div>
                <div className="text-sm font-medium">
                  {user?.username || 'Admin'}
                </div>
                <div className="text-xs text-slate-400">
                  ຜູ້ເບິ່ງແຍງລະບົບ
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>ອອກຈາກລະບົບ</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
