import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'
import { Download, QrCode, Loader2, Search, Printer, Copy, Check, ExternalLink } from 'lucide-react'
import { getProducts, getCategories, generateQR } from '../../lib/api'

export default function QRCodePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [qrData, setQrData] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [copied, setCopied] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
        if (prods.length > 0) {
          generate(prods[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function generate(product) {
    setSelectedProduct(product)
    setGenerating(true)
    setCopied(false)
    try {
      const qr = await generateQR(product.id)
      const token = qr.token
      setQrToken(token)

      const url = `${window.location.origin}/p/${token}`
      const dataUrl = await QRCodeLib.toDataURL(url, {
        width: 450,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        }
      })
      setQrData(dataUrl)
    } catch (err) {
      alert(err.message || 'ບໍ່ສາມາດສ້າງ QR ໄດ້')
    } finally {
      setGenerating(false)
    }
  }

  function downloadQR() {
    if (!qrData || !selectedProduct) return
    const link = document.createElement('a')
    link.href = qrData
    link.download = `QR-${selectedProduct.product_code || selectedProduct.name}.png`
    link.click()
  }

  function copyPublicUrl() {
    if (!qrToken) return
    const url = `${window.location.origin}/p/${qrToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    if (!qrData || !selectedProduct) return
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR - ${selectedProduct.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .qr-card { border: 2px solid #000; border-radius: 16px; padding: 24px; text-align: center; max-width: 300px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .code { font-family: monospace; color: #555; margin-bottom: 16px; font-size: 14px; }
            img { width: 220px; height: 220px; }
            .brand { font-size: 12px; font-weight: bold; color: #888; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="title">${selectedProduct.name}</div>
            <div class="code">CODE: ${selectedProduct.product_code || '-'}</div>
            <img src="${qrData}" />
            <div class="brand">QRTrace Verified</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter
      ? p.category_id === categoryFilter
      : true

    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR ລະຫັດ</h1>
        <p className="mt-1 text-sm text-slate-500">
          ສ້າງ, ພິມ ແລະ ດາວໂຫຼດ QR Code ສຳລັບສິນຄ້າ
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Product selector list */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">ເລືອກສິນຄ້າ</h2>
            <span className="text-xs text-slate-500">
              {filteredProducts.length} ລາຍການ
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400 bg-white"
            >
              <option value="">ໝວດໝູ່ທັງໝົດ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                ກຳລັງໂຫຼດ...
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                ບໍ່ພົບສິນຄ້າ
              </p>
            )}

            {filteredProducts.map((product) => {
              const isSelected = selectedProduct?.id === product.id
              return (
                <button
                  key={product.id}
                  onClick={() => generate(product)}
                  disabled={generating && isSelected}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-3">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className={`mt-0.5 font-mono text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {product.product_code || 'No Code'} • {product.category_name || '-'}
                    </p>
                  </div>

                  {generating && isSelected ? (
                    <Loader2 size={18} className="animate-spin text-slate-400 shrink-0" />
                  ) : (
                    <QrCode size={20} className={isSelected ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* QR preview & Print panel */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {selectedProduct && qrData ? (
            <div className="flex flex-col items-center w-full max-w-xs text-center">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                QR Code Preview
              </span>

              <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md my-2">
                <img
                  src={qrData}
                  alt="Product QR Code"
                  className="h-56 w-56 mx-auto"
                />
              </div>

              <h3 className="mt-3 font-bold text-lg text-slate-900">
                {selectedProduct.name}
              </h3>
              <p className="font-mono text-xs text-slate-500">
                {selectedProduct.product_code}
              </p>

              {/* Public link input & copy */}
              <div className="mt-4 flex items-center gap-1 w-full bg-slate-50 border rounded-xl p-1.5 text-xs">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/p/${qrToken}`}
                  className="bg-transparent flex-1 px-2 font-mono text-slate-600 outline-none truncate"
                />
                <button
                  onClick={copyPublicUrl}
                  title="Copy link"
                  className="p-1.5 rounded-lg bg-white border text-slate-700 hover:bg-slate-100 transition shrink-0 flex items-center gap-1 font-medium"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'ກ໋ອບແລ້ວ' : 'ກ໋ອບ'}</span>
                </button>
                <a
                  href={`/p/${qrToken}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open public page"
                  className="p-1.5 rounded-lg bg-white border text-slate-700 hover:bg-slate-100 transition shrink-0"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3 w-full">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  <Printer size={18} />
                  ພິມ QR
                </button>

                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  <Download size={18} />
                  ດາວໂຫຼດ
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <QrCode size={70} strokeWidth={1} className="mx-auto text-slate-300" />
              <p className="mt-4 font-medium text-slate-500">ເລືອກສິນຄ້າເພື່ອສ້າງ QR Code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
