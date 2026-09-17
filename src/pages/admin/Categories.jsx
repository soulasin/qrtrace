import { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Tag,
  Check,
} from 'lucide-react'
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '../../lib/api'

const COMMON_CATEGORIES = [
  'ອາຫານ ແລະ ເຄື່ອງດື່ມ',
  'ເຄື່ອງໃຊ້ປະຈຳວັນ',
  'ເຄື່ອງສຳອາງ',
  'ເສື້ອຜ້າ ແລະ ແຟຊັນ',
  'ເຄື່ອງໃຊ້ໄຟຟ້າ',
  'ອື່ນໆ',
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err.message || 'ໂຫຼດຂໍ້ມູນລົ້ມເຫຼວ')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setDescription('')
  }

  function openForm() {
    resetForm()
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setName('')
    setDescription('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      alert('ກະລຸນາໃສ່ຊື່ໝວດໝູ່')
      return
    }

    setSaving(true)

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
      })

      closeForm()
      await refresh()
    } catch (err) {
      alert(err.message || 'ບໍ່ສາມາດສ້າງໝວດໝູ່ໄດ້')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('ລຶບໝວດໝູ່ນີ້?')) return

    try {
      await deleteCategory(id)
      await refresh()
    } catch (err) {
      alert(
        err.message ||
        'ລຶບລົ້ມເຫຼວ — ອາດຍັງມີສິນຄ້າຢູ່ໃນໝວດໝູ່ນີ້'
      )
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ໝວດໝູ່</h1>
          <p className="mt-1 text-sm text-slate-500">
            ຈັດກຸ່ມສິນຄ້າໃຫ້ຮ້ານຄົ້ນຫາ ແລະ ຈັດການໄດ້ງ່າຍ
          </p>
        </div>

        <button
          onClick={openForm}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          <Plus size={18} />
          ເພີ່ມໝວດໝູ່
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form Modal / Drawer */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <Tag size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">ໝວດໝູ່ໃໝ່</h2>
                <p className="text-xs text-slate-500">
                  ໃສ່ພຽງຊື່ໝວດໝູ່ ແລ້ວນຳໄປເລືອກໃຫ້ສິນຄ້າໄດ້ທັນທີ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  ຊື່ໝວດໝູ່ <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ເຊັ່ນ: ສິນຄ້າກະສິກຳ, ອາຫານແປຮູບ, ເຄື່ອງດື່ມ..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  ລາຍລະອຽດ
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ລາຍລະອຽດຂອງໝວດໝູ່"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-sm font-semibold text-slate-800">ໝວດໝູ່ທີ່ນິຍົມ</p>
              <p className="mt-1 text-xs text-slate-500">ເລືອກເພື່ອໃສ່ຊື່ໝວດໝູ່ໄດ້ຢ່າງໄວ</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {COMMON_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setName(category)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                ຍົກເລີກ
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-md"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>ສ້າງໝວດໝູ່</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-slate-400 py-16">
          <Loader2 className="h-5 w-5 animate-spin" />
          ກຳລັງໂຫຼດ...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Tag size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">ຍັງບໍ່ມີໝວດໝູ່</p>
              <p className="text-xs text-slate-400 mt-1">ກົດ “ເພີ່ມໝວດໝູ່” ເພື່ອສ້າງປະເພດສິນຄ້າໃໝ່</p>
            </div>
          )}

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {cat.description || 'ບໍ່ມີລາຍລະອຽດ'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition shrink-0"
                    title="ລຶບໝວດໝູ່"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  ພ້ອມໃຊ້ເລືອກໃຫ້ສິນຄ້າໃນຮ້ານ
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
