import { useEffect, useState } from 'react'
import {
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getProductByToken, recordScan } from '../../lib/api'

const DEFAULT_STANDARD_FIELDS = [
  { field_key: 'manufacturer_name', field_label: 'ຊື່ຜູ້ຜະລິດ' },
  { field_key: 'origin_source', field_label: 'ແຫຼ່ງຜະລິດ' },
  { field_key: 'production_location', field_label: 'ສະຖານທີ່ຜະລິດ' },
  { field_key: 'product_type', field_label: 'ປະເພດສິນຄ້າ' },
  { field_key: 'production_date', field_label: 'ວັນທີຜະລິດ' },
  { field_key: 'lot_number', field_label: 'ເລກລັອດ' },
  { field_key: 'expiry_date', field_label: 'ວັນໝົດອາຍຸ' },
]

export default function ProductPage() {
  const { token } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductByToken(token)
        setProduct(data)
        // Record scan log
        await recordScan(token).catch(() => {})
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          ກຳລັງໂຫຼດ...
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm max-w-md w-full">
          <Package size={60} className="mx-auto text-slate-300" />
          <h1 className="mt-5 text-2xl font-bold text-slate-900">ບໍ່ພົບຂໍ້ມູນສິນຄ້າ</h1>
          <p className="mt-2 text-sm text-slate-500">
            QR ລະຫັດ ນີ້ບໍ່ຖືກຕ້ອງ ຫຼື ສິນຄ້າບໍ່ມີໃນລະບົບ.
          </p>
        </div>
      </div>
    )
  }

  function getFieldValue(field) {
    if (field.value !== undefined && field.value !== null && String(field.value).trim() !== '') {
      return String(field.value)
    }
    if (product.attributes && product.attributes[field.field_key]) {
      return String(product.attributes[field.field_key])
    }
    if (product[field.field_key]) {
      return String(product[field.field_key])
    }
    return '-'
  }

  const fieldsToRender = (product.fields && product.fields.length > 0)
    ? product.fields
    : DEFAULT_STANDARD_FIELDS

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm">
            QR
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">QRTrace</h1>
            <p className="text-xs text-slate-500">ຂໍ້ມູນສິນຄ້າ</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-5 py-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Product Header */}
          <div className="border-b border-slate-100 p-7">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 size={15} />
              <span>ສິນຄ້າທີ່ກວດສອບແລ້ວ</span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {product.product_code && (
                <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                  {product.product_code}
                </span>
              )}

              {product.category_name && (
                <span className="inline-block rounded-lg bg-slate-900 text-white px-3 py-1 text-xs font-semibold">
                  {product.category_name}
                </span>
              )}
            </div>
          </div>

          {/* Product Content Body */}
          <div className="p-7 space-y-8">
            {product.description && (
              <div>
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">ລາຍລະອຽດ</h2>
                <p className="mt-2 leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {product.description}
                </p>
              </div>
            )}

            {/* Information Fields */}
            <div>
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400 mb-3">
                ຂໍ້ມູນສິນຄ້າ
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {fieldsToRender.map((field) => {
                  const val = getFieldValue(field)
                  return (
                    <div
                      key={field.id || field.field_key}
                      className="grid gap-1 px-5 py-3.5 sm:grid-cols-2 hover:bg-slate-50/60 transition"
                    >
                      <p className="text-sm font-medium text-slate-500">
                        {field.field_label}
                      </p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {val}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer metadata info */}
            <div className="grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">ລົງທະບຽນເມື່ອ</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">ລະຫັດສິນຄ້າ</p>
                  <p className="text-sm font-semibold font-mono text-slate-900">
                    {product.product_code || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Product information provided by QRTrace
        </p>
      </main>
    </div>
  )
}
