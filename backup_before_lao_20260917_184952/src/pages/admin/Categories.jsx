import { useEffect, useState } from 'react'

import {
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import {
  getCategories,
  addCategory,
  deleteCategory,
} from '../../lib/db'

function Categories() {

  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setCategories(getCategories())
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      alert('Category name is required.')
      return
    }

    addCategory({
      name: name.trim(),
      description: description.trim(),
      fields: [],
    })

    setName('')
    setDescription('')
    setShowForm(false)

    refresh()
  }

  function handleDelete(id) {
    if (!confirm('Delete this category?')) {
      return
    }

    deleteCategory(id)
    refresh()
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Define product types for your system.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {showForm && (

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex justify-between">

            <h2 className="font-semibold">
              New Category
            </h2>

            <button
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border px-3 py-2.5"
            />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Description"
              rows="3"
              className="w-full rounded-lg border px-3 py-2.5"
            />

            <button
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Create Category
            </button>

          </form>

        </div>

      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {categories.map((category) => (

          <div
            key={category.id}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >

            <div className="flex justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  {category.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {category.description}
                </p>
              </div>

              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>

            </div>

            <div className="mt-5 border-t pt-4">

              <p className="text-xs uppercase text-slate-400">
                Custom Fields
              </p>

              <p className="mt-1 text-2xl font-bold">
                {category.fields?.length || 0}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Categories
