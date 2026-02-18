import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type Reservation = Awaited<ReturnType<typeof api.myReservations>>[number]

export default function MyReservationsPage() {
  const { user } = useAuth()

  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    api
      .myReservations()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  async function cancel(id: number) {
    setActionError(null)
    setBusyId(id)
    try {
      await api.cancelReservation(id)
      const next = await api.myReservations()
      setItems(next)
    } catch (e: any) {
      setActionError(e?.message || 'Cancel failed')
    } finally {
      setBusyId(null)
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">My reservations</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Login to view and manage your reservations.</p>
        <div className="mt-4">
          <Link className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400" to="/login">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My reservations</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Cancel only upcoming reservations.</p>
        </div>
        <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white" to="/movies">
          Browse movies
        </Link>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      {actionError ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{actionError}</div> : null}

      <div className="grid gap-3">
        {items.length === 0 ? <div className="text-sm text-slate-600 dark:text-white/70">No reservations yet.</div> : null}
        {items.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <div className="text-sm font-medium">Reservation #{r.id}</div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  Movie: {r.movieTitle} • Auditorium: {r.auditoriumName}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  Time: {new Date(r.showtimeStartTime).toLocaleString()} – {new Date(r.showtimeEndTime).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  Showtime ID: {r.showtimeId} • Seats: {(r.seatLabels || r.seatIds.map(String)).join(', ') || '—'}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/60">
                  Status: {r.status} • Total: ₹{(r.totalAmountCents / 100).toFixed(2)}
                </div>
              </div>

              {r.status === 'CANCELLED' ? null : (
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                  onClick={() => cancel(r.id)}
                  disabled={busyId === r.id}
                >
                  {busyId === r.id ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
