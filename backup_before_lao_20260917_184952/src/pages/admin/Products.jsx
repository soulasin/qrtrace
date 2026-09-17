import { useEffect, useState } from 'react'

import {
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import {
  getProducts,
  getCategories,
  addProduct,
  deleteProduct,
} from '../../lib/db'

function Products() {

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    productCode: '',
    categoryId: '',
    description: '',
    attributes: {},
  })

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setProducts(getProducts())
    setCategories(getCategories())
  }

  const selectedCategory = categories.find(
    (category) => category.id === form.categoryId
  )

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleAttributeChange(name, value) {
    setForm((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        [name]: value,
      },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name || !form.productCode || !form.categoryId) {
      alert('Please fill Product Name, Product Code and Category.')
      return
    }

    addProduct(form)

    setForm({
      name: '',
      productCode: '',
      categoryId: '',
      description: '',
      attributes: {},
    })

    setShowForm(false)

    refresh()
  }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) {
      return
    }

    deleteProduct(id)

    refresh()
  }

  function getCategoryName(categoryId) {
    return categories.find(
      (category) => category.id === categoryId
    )?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage real local products.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {showForm && (

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-lg font-semibold">
              Create Product
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-900"
            >
              <X size={20} />
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Organic Jasmine Rice"
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Code
                </label>

                <input
                  name="productCode"
                  value={form.productCode}
                  onChange={handleChange}
                  placeholder="AGR-0001"
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-500"
                />
              </div>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5"
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Product description..."
                className="w-full rounded-lg border px-3 py-2.5"
              />

            </div>

            {selectedCategory?.fields?.length > 0 && (

              <div className="rounded-lg bg-slate-50 p-5">

                <h3 className="mb-4 font-semibold">
                  {selectedCategory.name} Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  {selectedCategory.fields.map((field) => (

                    <div key={field.id}>

                      <label className="mb-2 block text-sm font-medium">
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        )}
                      </label>

                      <input
                        type={field.type}
                        value={
                          form.attributes[field.name] || ''
                        }
                        onChange={(event) =>
                          handleAttributeChange(
                            field.name,
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5"
                      />

                    </div>

                  ))}

                </div>

              </div>

            )}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                Create Product
              </button>

            </div>

          </form>

        </div>

      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-xs uppercase text-slate-500">

            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">QR Token</th>
              <th className="px-6 py-3">Action</th>
            </tr>

          </thead>

          <tbody className="divide-y">

            {products.length === 0 && (

              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No products yet. Create your first product.
                </td>
              </tr>

            )}

            {products.map((product) => (

              <tr
                key={product.id}
                className="hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-mono text-xs">
                  {product.productCode}
                </td>

                <td className="px-6 py-4 font-medium">
                  {product.name}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {getCategoryName(product.categoryId)}
                </td>

                <td className="max-w-48 truncate px-6 py-4 font-mono text-xs text-slate-400">
                  {product.qrToken}
                </td>

                <td className="px-6 py-4">

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Products
