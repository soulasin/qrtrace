import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const location = useLocation()

  let auth = null

  try {
    auth = JSON.parse(localStorage.getItem('qrtrace_auth'))
  } catch {
    auth = null
  }

  const isAuthenticated = auth?.loggedIn === true

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
