import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type Summary = Awaited<ReturnType<typeof api.adminReportSummary>>
type ShowtimeRow = Awaited<ReturnType<typeof api.adminReportShowtimes>>['showtimes'][number]

export default function AdminReportsPage() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState<Summary | null>(null)
  const [showtimes, setShowtimes] = useState<{ date: string; showtimes: ShowtimeRow[] } | null>(null)

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([api.adminReportSummary(date), api.adminReportShowtimes(date)])
      .then(([s, st]) => {
        setSummary(s)
        setShowtimes(st)
      })
      .catch((e: any) => setError(e?.message || 'Failed to load reports'))
      .finally(() => setLoading(false))
  }, [user, isAdmin, date])

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">Admin reports</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Login as an admin to view reports.</p>
        <div className="mt-4">
          <Link className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400" to="/login">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">Admin reports</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">You do not have access to this page.</p>
        <div className="mt-4">
          <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white" to="/movies">
            Back to movies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Capacity and revenue overview.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-white/70">Date</label>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      {summary ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs text-slate-500 dark:text-white/60">Reservations</div>
            <div className="mt-1 text-lg font-semibold">{summary.confirmedSeats} seats booked</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs text-slate-500 dark:text-white/60">Revenue</div>
            <div className="mt-1 text-lg font-semibold">₹{(summary.totalRevenueCents / 100).toFixed(2)}</div>
            <div className="text-sm text-slate-500 dark:text-white/60">For {summary.date}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs text-slate-500 dark:text-white/60">Occupancy</div>
            <div className="mt-1 text-lg font-semibold">{(summary.occupancyRate * 100).toFixed(1)}%</div>
            <div className="text-sm text-slate-500 dark:text-white/60">Booked seats / capacity</div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-slate-200 p-4 dark:border-white/10">
          <div className="text-sm font-medium">Showtimes</div>
          <div className="text-xs text-slate-500 dark:text-white/60">Per-showtime capacity, booked seats, and revenue.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-500 dark:text-white/60">
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Auditorium</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(showtimes?.showtimes || []).map((row: ShowtimeRow) => (
                <tr key={row.showtimeId} className="border-b border-slate-200 last:border-b-0 dark:border-white/10">
                  <td className="px-4 py-3 font-medium">{row.movieTitle}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-white/70">{row.auditoriumName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-white/70">{new Date(row.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-white/70">{row.capacity}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-white/70">{row.bookedSeats}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-white/70">₹{(row.revenueCents / 100).toFixed(2)}</td>
                </tr>
              ))}
              {(showtimes?.showtimes || []).length === 0 && !loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500 dark:text-white/60" colSpan={6}>
                    No showtimes for this date.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
