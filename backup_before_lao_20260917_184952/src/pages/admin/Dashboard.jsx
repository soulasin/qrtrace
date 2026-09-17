import { useState, useEffect } from 'react'

import {
  Package,
  Tags,
  QrCode,
  ScanLine,
} from 'lucide-react'

import {
  getProducts,
  getCategories,
  getScans,
} from '../../lib/db'

function Dashboard() {

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [scans, setScans] = useState([])

  useEffect(() => {
    setProducts(getProducts())
    setCategories(getCategories())
    setScans(getScans())
  }, [])

  const stats = [
    {
      name: 'Products',
      value: products.length,
      icon: Package,
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: Tags,
    },
    {
      name: 'QR Codes',
      value: products.length,
      icon: QrCode,
    },
    {
      name: 'Scans',
      value: scans.length,
      icon: ScanLine,
    },
  ]

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          QRTrace local product management system
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon = stat.icon

          return (
            <div
              key={stat.name}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >

              <div className="flex justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    {stat.name}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                  <Icon size={21} />
                </div>

              </div>

            </div>
          )
        })}

      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="font-semibold">
          How QRTrace works
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">

          {[
            ['01', 'Create Category'],
            ['02', 'Create Product'],
            ['03', 'Generate QR'],
            ['04', 'Scan Product'],
          ].map(([number, title]) => (

            <div
              key={number}
              className="rounded-lg bg-slate-50 p-5"
            >
              <p className="text-sm font-bold text-slate-400">
                {number}
              </p>

              <p className="mt-2 font-medium">
                {title}
              </p>
            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default Dashboard
