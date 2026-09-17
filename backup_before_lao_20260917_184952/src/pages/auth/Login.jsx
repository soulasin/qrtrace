import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/admin'

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem(
          'qrtrace_auth',
          JSON.stringify({
            loggedIn: true,
            username: 'admin',
            loginAt: new Date().toISOString(),
          })
        )

        navigate(from, { replace: true })
      } else {
        setError('Invalid username or password')
      }

      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white text-2xl font-bold shadow-lg">
            QR
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            QRTrace
          </h1>

          <p className="mt-2 text-slate-500">
            Product Information System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Admin Login
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to manage your products
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <a
              href="/"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              ← Back to Home
            </a>
          </div>

        </div>

        {/* Demo info */}
        <div className="mt-5 text-center text-xs text-slate-400">
          Local Development Mode
        </div>

      </div>
    </div>
  )
}
