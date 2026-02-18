import MoviesPage from './MoviesPage'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="grid gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-emerald-500/10 dark:from-indigo-500/20 dark:via-fuchsia-500/10 dark:to-emerald-500/10" />
        <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-700 backdrop-blur dark:border-white/10 dark:bg-black/20 dark:text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Fast booking, real-time seats
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Reserve your seats in seconds
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70 md:text-base">
              Browse movies, pick a showtime, and lock your seats with a smooth checkout flow. No clutter—just tickets.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/movies"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Browse Movies
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-black/20 dark:text-white/80">
                <div className="text-xs text-slate-500 dark:text-white/60">Availability</div>
                <div className="mt-1 font-medium">Live seat status</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-black/20 dark:text-white/80">
                <div className="text-xs text-slate-500 dark:text-white/60">Speed</div>
                <div className="mt-1 font-medium">Quick reservations</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-black/20 dark:text-white/80">
                <div className="text-xs text-slate-500 dark:text-white/60">Admin</div>
                <div className="mt-1 font-medium">Movies & showtimes</div>
              </div>
            </div>
        </div>
      </section>

      <section>
        <MoviesPage />
      </section>
    </div>
  )
}
