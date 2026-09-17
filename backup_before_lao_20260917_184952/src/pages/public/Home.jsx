import { Link } from 'react-router-dom'
import {
  QrCode,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  ScanLine
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              QR
            </div>

            <div>
              <div className="font-bold text-lg">
                QRTrace
              </div>

              <div className="text-xs text-slate-500">
                Product Information System
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Admin Login
          </Link>

        </div>
      </nav>


      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 mb-6">
            <ShieldCheck size={16} />
            Digital Product Verification
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Know Your Product.
            <span className="block text-slate-500 mt-2">
              Scan. Verify. Trace.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            QRTrace connects physical products with digital information
            through QR codes, making product information easier to access
            and manage.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

            <div className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold">
              <ScanLine size={20} />
              Scan Product QR
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100 transition"
            >
              Admin Portal
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>


        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">

          <Feature
            icon={<QrCode size={24} />}
            title="QR Code"
            text="Each product can have its own unique QR code."
          />

          <Feature
            icon={<PackageCheck size={24} />}
            title="Product Information"
            text="Store and display product information through a digital page."
          />

          <Feature
            icon={<ShieldCheck size={24} />}
            title="Verification"
            text="Allow users to verify product information by scanning."
          />

        </div>

      </section>


      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          QRTrace — Local Development Demo
        </div>
      </footer>

    </div>
  )
}


function Feature({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">

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
