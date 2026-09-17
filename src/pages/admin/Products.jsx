import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Search, X, Loader2, QrCode, Download, ExternalLink, Package, FileText } from 'lucide-react'
import QRCodeLib from 'qrcode'
import {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  generateQR,
} from '../../lib/api'

const DEFAULT_FALLBACK_FIELDS = [
  { field_key: 'manufacturer_name', field_label: 'ຊື່ຜູ້ຜະລິດ', field_type: 'text', required: true },
  { field_key: 'origin_source', field_label: 'ແຫຼ່ງຜະລິດ', field_type: 'text', required: false },
  { field_key: 'production_location', field_label: 'ສະຖານທີ່ຜະລິດ', field_type: 'text', required: false },
  { field_key: 'product_type', field_label: 'ປະເພດສິນຄ້າ', field_type: 'text', required: true },
  { field_key: 'production_date', field_label: 'ວັນທີຜະລິດ', field_type: 'date', required: true },
  { field_key: 'lot_number', field_label: 'ເລກລັອດ', field_type: 'text', required: false },
  { field_key: 'expiry_date', field_label: 'ວັນໝົດອາຍຸ', field_type: 'date', required: false },
]

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    productCode: '',
    categoryId: '',
    description: '',
    attributes: {},
  })

  // Quick QR Preview Modal
  const [qrModalProduct, setQrModalProduct] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [generatingQr, setGeneratingQr] = useState(false)

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories(),
      ])
      setProducts(prods)
      setCategories(cats)
    } catch {
      setError('ໂຫຼດຂໍ້ມູນລົ້ມເຫຼວ')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(
    (c) => c.id === form.categoryId
  )

  const activeCategoryFields = (selectedCategory?.fields && selectedCategory.fields.length > 0)
    ? selectedCategory.fields
    : DEFAULT_FALLBACK_FIELDS

  function openCreateForm() {
    setEditingId(null)
    setForm({
      name: '',
      productCode: '',
      categoryId: categories[0]?.id || '',
      description: '',
      attributes: {},
    })
    setShowForm(true)
  }

  function openEditForm(product) {
    setEditingId(product.id)
    
    // Map initial attributes from product attributes and fields
    const initialAttrs = { ...(product.attributes || {}) }
    if (Array.isArray(product.fields)) {
      product.fields.forEach((f) => {
        if (f.field_key && f.value) {
          initialAttrs[f.field_key] = f.value
        }
      })
    }

    setForm({
      name: product.name || '',
      productCode: product.product_code || '',
      categoryId: product.category_id || '',
      description: product.description || '',
      attributes: initialAttrs,
    })
    setShowForm(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((curr) => ({ ...curr, [name]: value }))
  }

  function handleAttrChange(key, value) {
    setForm((curr) => ({
      ...curr,
      attributes: { ...curr.attributes, [key]: value },
    }))
  }

  function handleCategoryChange(event) {
    const catId = event.target.value
    setForm((curr) => ({
      ...curr,
      categoryId: catId,
      attributes: {},
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      alert('ກະລຸນາໃສ່ ຊື່ສິນຄ້າ')
      return
    }

    if (!form.productCode.trim()) {
      alert('ກະລຸນາກອກ ລະຫັດສິນຄ້າ (Product Code)')
      return
    }

    if (!form.categoryId) {
      alert('ກະລຸນາເລືອກ ໝວດໝູ່')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        productCode: form.productCode.trim(),
        categoryId: form.categoryId,
        description: form.description.trim(),
        manufacturerName: form.attributes.manufacturer_name || '',
        originSource: form.attributes.origin_source || '',
        productionLocation: form.attributes.production_location || '',
        productType: form.attributes.product_type || '',
        productionDate: form.attributes.production_date || null,
        lotNumber: form.attributes.lot_number || '',
        expiryDate: form.attributes.expiry_date || null,
        attributes: form.attributes,
      }

      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }

      setShowForm(false)
      await refresh()
    } catch (err) {
      alert(err.message || 'ບໍ່ສາມາດບັນທຶກສິນຄ້າໄດ້')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('ລຶບສິນຄ້ານີ້?')) return

    try {
      await deleteProduct(id)
      await refresh()
    } catch (err) {
      alert(err.message || 'ລຶບລົ້ມເຫຼວ')
    }
  }

  async function openQrModal(product) {
    setQrModalProduct(product)
    setGeneratingQr(true)
    setQrDataUrl('')
    setQrToken('')

    try {
      const qr = await generateQR(product.id)
      const token = qr.token
      setQrToken(token)

      const url = `${window.location.origin}/p/${token}`
      const dataUrl = await QRCodeLib.toDataURL(url, {
        width: 400,
        margin: 2,
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      alert(err.message || 'ບໍ່ສາມາດສ້າງ QR ໄດ້')
    } finally {
      setGeneratingQr(false)
    }
  }

  function downloadQr() {
    if (!qrDataUrl || !qrModalProduct) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `${qrModalProduct.product_code || qrModalProduct.id}-QR.png`
    link.click()
  }

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter
      ? p.category_id === categoryFilter
      : true

    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ສິນຄ້າ</h1>
          <p className="mt-1 text-sm text-slate-500">
            ຈັດການ ແລະ ຕິດຕາມສິນຄ້າທັງໝົດໃນລະບົບ
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          <Plus size={18} />
          ເພີ່ມສິນຄ້າ
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ, ລະຫັດ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-400 shadow-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 shadow-sm"
        >
          <option value="">ໝວດໝູ່ທັງໝົດ</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form Modal / Drawer */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'ແກ້ໄຂສິນຄ້າ' : 'ສ້າງສິນຄ້າໃໝ່'}
                </h2>
                <p className="text-xs text-slate-500">ກອກຂໍ້ມູນສິນຄ້າ ແລະ ລາຍລະອຽດໃຫ້ຄົບຖ້ວນ</p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-900 transition p-2 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-slate-700" />
                ຂໍ້ມູນພື້ນຖານສິນຄ້າ
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ຊື່ສິນຄ້າ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ເຊັ່ນ: ເຂົ້າຫອມມະລິ ອິນຊີ"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ລະຫັດສິນຄ້າ (Product Code) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="productCode"
                    value={form.productCode}
                    onChange={handleChange}
                    placeholder="ເຊັ່ນ: AGR-0001"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ໝວດໝູ່ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                    required
                  >
                    <option value="">ເລືອກໝວດໝູ່</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ລາຍລະອຽດສິນຄ້າ (Description)
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="ກອກລາຍລະອຽດສິນຄ້າ..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Product Details & Custom Fields Section */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package size={16} className="text-slate-700" />
                ຂໍ້ມູນລາຍລະອຽດສິນຄ້າ {selectedCategory ? `— ${selectedCategory.name}` : ''}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {activeCategoryFields.map((field) => (
                  <div key={field.id || field.field_key}>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      {field.field_label}
                      {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        value={form.attributes[field.field_key] || ''}
                        onChange={(e) =>
                          handleAttrChange(field.field_key, e.target.value)
                        }
                        rows="2"
                        placeholder={`ກອກ ${field.field_label}...`}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                        required={Boolean(field.required)}
                      />
                    ) : (
                      <input
                        type={field.field_type || 'text'}
                        value={form.attributes[field.field_key] || ''}
                        onChange={(e) =>
                          handleAttrChange(field.field_key, e.target.value)
                        }
                        placeholder={`ກອກ ${field.field_label}...`}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                        required={Boolean(field.required)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 transition"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-md"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editingId ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງສິນຄ້າ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                  <th className="px-6 py-3.5 font-semibold">ລະຫັດ</th>
                  <th className="px-6 py-3.5 font-semibold">ຊື່ສິນຄ້າ</th>
                  <th className="px-6 py-3.5 font-semibold">ໝວດໝູ່</th>
                  <th className="px-6 py-3.5 font-semibold">QR Code</th>
                  <th className="px-6 py-3.5 font-semibold text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      ບໍ່ພົບສິນຄ້າ
                    </td>
                  </tr>
                )}

                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                      {product.product_code || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {product.category_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.qr?.token ? (
                        <button
                          onClick={() => openQrModal(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <QrCode size={13} />
                          <span>ສະແດງ QR</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openQrModal(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 transition"
                        >
                          <QrCode size={13} />
                          <span>ສ້າງ QR</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(product)}
                          title="ແກ້ໄຂ"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          title="ລຶບ"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <button
              onClick={() => setQrModalProduct(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg text-slate-900">QR Code ສິນຄ້າ</h3>
            <p className="text-xs text-slate-500 mt-1">{qrModalProduct.name}</p>

            <div className="my-6 flex justify-center items-center min-h-[200px]">
              {generatingQr ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 size={20} className="animate-spin" />
                  ກຳລັງສ້າງ...
                </div>
              ) : qrDataUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                  <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 mx-auto" />
                </div>
              ) : null}
            </div>

            {qrToken && (
              <div className="mb-4">
                <a
                  href={`/p/${qrToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-mono"
                >
                  <span>/p/{qrToken.substring(0, 16)}...</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={downloadQr}
                disabled={!qrDataUrl}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <Download size={16} />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
