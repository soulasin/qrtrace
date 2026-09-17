import { useEffect, useState } from 'react'
import { ScanLine, Loader2, Search, Calendar, Package } from 'lucide-react'
import { getScans } from '../../lib/api'

export default function ScanLogs() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    getScans()
      .then(setScans)
      .catch(() => setError('ໂຫຼດຂໍ້ມູນລົ້ມເຫຼວ'))
      .finally(() => setLoading(false))
  }, [])

  const filteredScans = scans.filter(
    (s) =>
      s.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.token?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lastScanTime = scans.length > 0
    ? new Date(scans[0].scanned_at).toLocaleString()
    : '-'

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ປະຫວັດການສະແກນ</h1>
        <p className="mt-1 text-sm text-slate-500">
          ບັນທຶກ ແລະ ຕິດຕາມກິດຈະກຳ QR scan ທັງໝົດ
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">ການສະແກນທັງໝົດ</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{scans.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
            <ScanLine size={20} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">ສະແກນລ່າສຸດ</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 truncate max-w-[200px]">
              {lastScanTime}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
            <Calendar size={20} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-medium text-slate-500">ສະຖານະ</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              ● Live Tracking Active
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Package size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ScanLine size={20} className="text-slate-700" />
            <div>
              <h2 className="font-semibold text-slate-900">ລາຍການສະແກນ</h2>
              <p className="text-xs text-slate-500">
                ສະແດງ {filteredScans.length} ລາຍການ
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາປະຫວັດສະແກນ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            ກຳລັງໂຫຼດ...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">ສິນຄ້າ</th>
                  <th className="px-6 py-3.5 font-semibold">ລະຫັດ</th>
                  <th className="px-6 py-3.5 font-semibold">QR Token</th>
                  <th className="px-6 py-3.5 font-semibold">ເວລາស្ແກນ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {scan.product_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {scan.product_code || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-40">
                      {scan.token || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {filteredScans.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      ຍັງບໍ່ມີການສະແກນ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
