import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Upload, Keyboard, X, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('camera') // 'camera' | 'upload' | 'manual'
  const [manualToken, setManualToken] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }

    if (activeTab === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, activeTab])

  const handleDecodedToken = (text) => {
    if (!text) return
    let token = text.trim()
    // If text is a full URL like http://localhost:5173/p/abc-123
    if (token.includes('/p/')) {
      const parts = token.split('/p/')
      token = parts[parts.length - 1]
    }
    stopCamera()
    onClose()
    navigate(`/p/${token}`)
  }

  const startCamera = async () => {
    setError('')
    setScanning(true)
    try {
      if (html5QrCodeRef.current) {
        await stopCamera()
      }
      const html5QrCode = new Html5Qrcode('qr-reader-container')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleDecodedToken(decodedText)
        },
        () => {}
      )
    } catch (err) {
      console.error('Camera error:', err)
      setError('ບໍ່ສາມາດເປີດກ້ອງໄດ້. ກະລຸນາກວດສອບສິດການນຳໃຊ້ກ້ອງ ຫຼື ໃຊ້ການອັບໂຫຼດຮູບແທນ.')
    } finally {
      setScanning(false)
    }
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping camera:', err)
      } finally {
        html5QrCodeRef.current = null
      }
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setScanning(true)

    try {
      const html5QrCode = new Html5Qrcode('qr-file-dummy')
      const decodedText = await html5QrCode.scanFile(file, true)
      handleDecodedToken(decodedText)
    } catch (err) {
      console.error('File scan error:', err)
      setError('ບໍ່ພົບ QR ລະຫັດ ໃນຮູບນີ້. ກະລຸນາລອງຮູບອື່ນ.')
    } finally {
      setScanning(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualToken.trim()) return
    handleDecodedToken(manualToken)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              QR
            </div>
            <h2 className="text-lg font-bold text-slate-900">ສະແກນ QR ລະຫັດ</h2>
          </div>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b bg-slate-50 p-1.5 gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition ${
              activeTab === 'camera'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera size={18} />
            ໃຊ້ກ້ອງ
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload size={18} />
            ອັບໂຫຼດຮູບ
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Keyboard size={18} />
            ປ້ອນ Token
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-xs overflow-hidden rounded-2xl bg-black border-2 border-slate-900 flex items-center justify-center">
                <div id="qr-reader-container" className="w-full h-full"></div>
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white gap-2">
                    <Loader2 size={24} className="animate-spin" />
                    <span>ກຳລັງເປີດກ້ອງ...</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                ວາງ QR ລະຫັດ ໃຫ້ຢູ່ເຄິ່ງກາງກອບເພື່ອສະແກນ
              </p>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center">
              <div id="qr-file-dummy" className="hidden"></div>
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition p-6 text-center">
                <Upload size={40} className="text-slate-400 mb-3" />
                <span className="font-semibold text-slate-700 text-sm">
                  ກົດເພື່ອເລືອກຮູບ QR ລະຫັດ
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  ສະໜັບສະໜູນ PNG, JPG, WEBP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {scanning && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  ກຳລັງກວດສອບຮູບ...
                </div>
              )}
            </div>
          )}

          {/* Manual Input Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ປ້ອນ QR Token ຫຼື URL ສິນຄ້າ
                </label>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="ເຊັ່ນ: a1b2c3d4-e5f6... ຫຼື http://.../p/token"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!manualToken.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <span>ກວດສອບສິນຄ້າ</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
