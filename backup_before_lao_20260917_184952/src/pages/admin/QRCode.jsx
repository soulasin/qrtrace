import { useEffect, useState } from 'react'

import QRCode from 'qrcode'
import {
  Download,
  QrCode,
} from 'lucide-react'

import {
  getProducts,
} from '../../lib/db'

function QRCodePage() {

  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [qrData, setQrData] = useState('')

  useEffect(() => {
    setProducts(getProducts())
  }, [])

  async function generate(product) {

    setSelected(product)

    const baseUrl = window.location.origin

    const url = `${baseUrl}/p/${product.qrToken}`

    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
    })

    setQrData(dataUrl)
  }

  function downloadQR() {

    if (!qrData || !selected) {
      return
    }

    const link = document.createElement('a')

    link.href = qrData
    link.download = `${selected.productCode}-QR.png`

    link.click()
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          QR Codes
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Generate real QR codes for your products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="font-semibold">
            Products
          </h2>

          <div className="mt-5 space-y-2">

            {products.length === 0 && (
              <p className="text-sm text-slate-400">
                Create a product first.
              </p>
            )}

            {products.map((product) => (

              <button
                key={product.id}
                onClick={() => generate(product)}
                className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-slate-50"
              >

                <div>
                  <p className="font-medium">
                    {product.name}
                  </p>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {product.productCode}
                  </p>
                </div>

                <QrCode size={20} />

              </button>

            ))}

          </div>

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="font-semibold">
            QR Preview
          </h2>

          {qrData ? (

            <div className="mt-6 flex flex-col items-center">

              <img
                src={qrData}
                alt="Product QR Code"
                className="h-64 w-64"
              />

              <p className="mt-4 font-semibold">
                {selected.name}
              </p>

              <p className="mt-1 max-w-full break-all text-center font-mono text-xs text-slate-400">
                {window.location.origin}/p/{selected.qrToken}
              </p>

              <button
                onClick={downloadQR}
                className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                <Download size={17} />
                Download QR
              </button>

            </div>

          ) : (

            <div className="flex min-h-80 items-center justify-center text-center text-slate-400">
              <div>
                <QrCode
                  size={80}
                  strokeWidth={1}
                  className="mx-auto"
                />

                <p className="mt-4">
                  Select a product
                </p>
              </div>
            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default QRCodePage
