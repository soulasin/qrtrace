import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  ScanLine
} from 'lucide-react'
import QRScannerModal from '../../components/QRScannerModal'

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              QR
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">
                QRTrace
              </div>
              <div className="text-xs text-slate-500">
                ລະບົບຂໍ້ມູນສິນຄ້າ
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            ສຳລັບຜູ້ດູແລ
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex-1">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 mb-6 shadow-sm">
            <ShieldCheck size={16} className="text-slate-900" />
            ລະບົບກວດສອບຂໍ້ມູນສິນຄ້າ
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            ຮູ້ຈັກສິນຄ້າຂອງທ່ານ
            <span className="block text-slate-500 mt-3">
              ສະແກນ • ກວດສອບ • ຕິດຕາມ
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            QRTrace ເຊື່ອມຕໍ່ສິນຄ້າຈິງເຂົ້າກັບຂໍ້ມູນດິຈິຕອນ
            ຜ່ານ QR ລະຫັດ ເພື່ອໃຫ້ຜູ້ໃຊ້ສາມາດເຂົ້າເຖິງ
            ແລະ ກວດສອບຂໍ້ມູນສິນຄ້າໄດ້ງ່າຍ.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ScanLine size={22} />
              ສະແກນ QR ລະຫັດ ສິນຄ້າ
            </button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100 transition"
            >
              ເຂົ້າລະບົບຜູ້ດູແລ
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Feature
            icon={<QrCode size={24} />}
            title="QR ລະຫັດ"
            text="ສິນຄ້າແຕ່ລະລາຍການສາມາດມີ QR ລະຫັດ ສະເພາະຂອງຕົນເອງ."
          />

          <Feature
            icon={<PackageCheck size={24} />}
            title="ຂໍ້ມູນສິນຄ້າ"
            text="ສະແດງຂໍ້ມູນສິນຄ້າ ແລະ ລາຍລະອຽດຜ່ານໜ້າດິຈິຕອນ."
          />

          <Feature
            icon={<ShieldCheck size={24} />}
            title="ການກວດສອບ"
            text="ຜູ້ໃຊ້ສາມາດກວດສອບຂໍ້ມູນສິນຄ້າຜ່ານ QR ລະຫັດ."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          QRTrace — ລະບົບຂໍ້ມູນສິນຄ້າ
        </div>
      </footer>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  )
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-lg text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {text}
      </p>
    </div>
  )
}
