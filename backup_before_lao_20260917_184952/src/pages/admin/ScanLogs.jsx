import { useEffect, useState } from 'react'

import {
  ScanLine,
} from 'lucide-react'

import {
  getScans,
  getProducts,
} from '../../lib/db'

function ScanLogs() {

  const [scans, setScans] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {

    setScans(getScans())
    setProducts(getProducts())

  }, [])

  function getProduct(id) {
    return products.find(
      (product) => product.id === id
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Scan Logs
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          QR scan activity stored locally.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b p-5">

          <ScanLine size={20} />

          <div>
            <h2 className="font-semibold">
              Scan History
            </h2>

            <p className="text-xs text-slate-500">
              {scans.length} total scans
            </p>
          </div>

        </div>

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-xs uppercase text-slate-500">

            <tr>
              <th className="px-6 py-3">
                Product
              </th>

              <th className="px-6 py-3">
                Code
              </th>

              <th className="px-6 py-3">
                Time
              </th>
            </tr>

          </thead>

          <tbody className="divide-y">

            {scans.map((scan) => {

              const product = getProduct(
                scan.productId
              )

              return (
                <tr key={scan.id}>

                  <td className="px-6 py-4 font-medium">
                    {product?.name || 'Unknown'}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs">
                    {product?.productCode || '-'}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {new Date(
                      scan.scannedAt
                    ).toLocaleString()}
                  </td>

                </tr>
              )

            })}

            {scans.length === 0 && (

              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No QR scans yet.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default ScanLogs
