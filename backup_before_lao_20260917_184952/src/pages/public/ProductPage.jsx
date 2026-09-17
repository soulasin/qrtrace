import { useEffect, useState } from 'react'

import {
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

import { useParams } from 'react-router-dom'

import {
  getProductByToken,
  getCategories,
  addScan,
} from '../../lib/db'

function ProductPage() {

  const { token } = useParams()

  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null)

  useEffect(() => {

    const found = getProductByToken(token)

    if (!found) {
      return
    }

    setProduct(found)

    const categories = getCategories()

    setCategory(
      categories.find(
        (item) => item.id === found.categoryId
      )
    )

    addScan(found.id)

  }, [token])

  if (!product) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <Package
            size={60}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This QR code is invalid or the product does not exist.
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Package size={21} />
          </div>

          <div>
            <h1 className="font-bold">
              QRTrace
            </h1>

            <p className="text-xs text-slate-500">
              Product Information
            </p>
          </div>

        </div>

      </header>

      <main className="mx-auto max-w-4xl p-5 py-10">

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="border-b p-7">

            <div className="flex items-center gap-2 text-sm text-green-600">

              <CheckCircle2 size={18} />

              Verified Product

            </div>

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <p className="mt-2 font-mono text-sm text-slate-500">
              {product.productCode}
            </p>

            {category && (

              <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                {category.name}
              </span>

            )}

          </div>

          <div className="p-7">

            {product.description && (

              <div className="mb-8">

                <h2 className="font-semibold">
                  Description
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  {product.description}
                </p>

              </div>

            )}

            {category?.fields?.length > 0 && (

              <div>

                <h2 className="font-semibold">
                  Product Information
                </h2>

                <div className="mt-4 divide-y rounded-xl border">

                  {category.fields.map((field) => {

                    const value =
                      product.attributes?.[field.name]

                    if (!value) {
                      return null
                    }

                    return (
                      <div
                        key={field.id}
                        className="grid gap-1 px-5 py-4 sm:grid-cols-2"
                      >

                        <p className="text-sm text-slate-500">
                          {field.label}
                        </p>

                        <p className="font-medium">
                          {value}
                        </p>

                      </div>
                    )

                  })}

                </div>

              </div>

            )}

            <div className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2">

              <div className="flex gap-3">

                <Calendar
                  size={19}
                  className="text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Registered
                  </p>

                  <p className="text-sm font-medium">
                    {new Date(
                      product.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

              <div className="flex gap-3">

                <MapPin
                  size={19}
                  className="text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Product Code
                  </p>

                  <p className="text-sm font-medium">
                    {product.productCode}
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

export default ProductPage
