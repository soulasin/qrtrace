import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Tags,
  QrCode,
  ScanLine,
  Loader2,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { getDashboard, getScans } from '../../lib/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getDashboard(), getScans()])
      .then(([dashData, scansData]) => {
        setData(dashData)
        setRecentScans(scansData.slice(0, 5))
      })
      .catch(() => setError('ໂຫຼດຂໍ້ມູນລົ້ມເຫຼວ'))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { name: 'ສິນຄ້າທັງໝົດ', value: data?.products, icon: Package, link: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { name: 'ໝວດໝູ່ສິນຄ້າ', value: data?.categories, icon: Tags, link: '/admin/categories', color: 'bg-purple-50 text-purple-600' },
    { name: 'QR ລະຫັດ active', value: data?.qrCodes, icon: QrCode, link: '/admin/qr-codes', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'ການສະແກນທັງໝົດ', value: data?.scans, icon: ScanLine, link: '/admin/scan-logs', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ແຜງຄວບຄຸມ (Dashboard)</h1>
          <p className="mt-1 text-sm text-slate-500">
            QRTrace — ລະບົບຂໍ້ມູນ ແລະ ຕິດຕາມສິນຄ້າ
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            <Plus size={18} />
            ເພີ່ມສິນຄ້າ
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 py-12">
          <Loader2 className="w-5 h-5 animate-spin" />
          ກຳລັງໂຫຼດ...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Link
                  key={stat.name}
                  to={stat.link}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{stat.name}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value ?? 0}
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} transition group-hover:scale-110`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Quick Workflow Guide */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-700" />
                    ຂັ້ນຕອນການເຮັດວຽກ QRTrace
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['01', 'ສ້າງໝວດໝູ່ສິນຄ້າ', 'ກຳນົດ Custom Fields', '/admin/categories'],
                    ['02', 'ເພີ່ມສິນຄ້າເຂົ້າລະບົບ', 'ກອກຂໍ້ມູນ ແລະ ລະຫັດ', '/admin/products'],
                    ['03', 'ສ້າງ QR ລະຫັດ', 'ພິມ ຫຼື ດາວໂຫຼດ QR', '/admin/qr-codes'],
                    ['04', 'ຕິດຕາມການສະແກນ', 'ເບິ່ງ Real-time Scan Logs', '/admin/scan-logs'],
                  ].map(([number, title, sub, link]) => (
                    <Link
                      key={number}
                      to={link}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100 transition flex items-start justify-between group"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-400 font-mono">{number}</span>
                        <h3 className="font-semibold text-slate-900 text-sm mt-1">{title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Scan Feed */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <ScanLine size={18} className="text-slate-700" />
                  ການສະແກນລ່າສຸດ
                </h2>
                <Link to="/admin/scan-logs" className="text-xs text-blue-600 hover:underline font-medium">
                  ເບິ່ງທັງໝົດ
                </Link>
              </div>

              <div className="space-y-3">
                {recentScans.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8">
                    ຍັງບໍ່ມີການສະແກນ
                  </p>
                )}

                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 truncate">{scan.product_name}</p>
                      <p className="text-slate-400 font-mono mt-0.5">{scan.product_code || '-'}</p>
                    </div>
                    <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                      {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
