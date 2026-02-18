import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import SeatPickerPage from './pages/SeatPickerPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminMoviesPage from './pages/AdminMoviesPage'
import AdminShowtimesPage from './pages/AdminShowtimesPage'
import { useAuth } from '../lib/auth'
import { getTheme, setTheme } from '../lib/theme'
import { useEffect, useState } from 'react'

export default function App() {
  const { user, logout } = useAuth()
  const [theme, setThemeState] = useState(getTheme())

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/30">
        <div className="flex w-full items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Movie Reservation
          </Link>
          <nav className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              onClick={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/movies">
              Movies
            </Link>

            <Link
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              to="/reservations"
            >
              My Reservations
            </Link>

            {isAdmin ? (
              <>
                <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/admin/reports">
                  Admin Reports
                </Link>
                <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/admin/movies">
                  Admin Movies
                </Link>
                <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/admin/showtimes">
                  Admin Showtimes
                </Link>
                <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/admin/users">
                  Admin Users
                </Link>
              </>
            ) : null}

            {user ? (
              <button
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10" to="/login">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="w-full px-4 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/showtimes/:id/seats" element={<SeatPickerPage />} />
          <Route path="/reservations" element={<MyReservationsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/movies" element={<AdminMoviesPage />} />
          <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </main>
    </div>
  )
}
