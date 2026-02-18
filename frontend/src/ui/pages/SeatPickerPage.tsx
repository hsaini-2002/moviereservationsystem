import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type Seat = { id: number; rowLabel: string; seatNumber: number }

export default function SeatPickerPage() {
  const params = useParams()
  const showtimeId = Number(params.id)

  const { user } = useAuth()

  const [seats, setSeats] = useState<Seat[]>([])
  const [booked, setBooked] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [auditoriumName, setAuditoriumName] = useState('')
  const [movieTitle, setMovieTitle] = useState('')
  const [startTime, setStartTime] = useState<string | null>(null)
  const [priceCents, setPriceCents] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, Seat[]>()
    for (const s of seats) {
      const arr = map.get(s.rowLabel) || []
      arr.push(s)
      map.set(s.rowLabel, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.seatNumber - b.seatNumber)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [seats])

  useEffect(() => {
    if (!Number.isFinite(showtimeId)) return

    setLoading(true)
    setError(null)

    setSuccess(null)

    Promise.all([api.seats(showtimeId), api.availability(showtimeId), api.showtime(showtimeId)])
      .then(([seatRes, avail, detail]) => {
        setSeats(seatRes.seats)
        setAuditoriumName(seatRes.auditoriumName)
        setBooked(new Set(avail.bookedSeatIds))
        setMovieTitle(detail.movieTitle)
        setStartTime(detail.startTime)
        setPriceCents(detail.priceCents)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [showtimeId])

  async function onReserve() {
    setActionError(null)
    setSuccess(null)

    if (!user) {
      setActionError('Please login first to reserve seats.')
      return
    }

    if (selected.size === 0) {
      setActionError('Select at least one seat.')
      return
    }

    setSubmitting(true)
    try {
      const seatIds = Array.from(selected)
      const res = await api.reserve(showtimeId, seatIds)
      setSelected(new Set())
      setBooked(new Set([...booked, ...res.seatIds]))
      setSuccess(`Reserved ${res.seatIds.length} seat(s) successfully.`)
    } catch (e: any) {
      setActionError(e?.message || 'Reservation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Choose seats</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
            {movieTitle ? `${movieTitle} • ` : ''}
            {startTime ? `${new Date(startTime).toLocaleString()} • ` : ''}
            {auditoriumName ? `${auditoriumName}` : 'Loading…'}
          </p>
        </div>
        <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white" to="/movies">
          ← Back to movies
        </Link>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-5 text-center text-xs tracking-widest text-slate-400 dark:text-white/50">SCREEN</div>
          <div className="mx-auto mb-6 h-2 w-full max-w-xl rounded-full bg-gradient-to-r from-indigo-500/40 via-white/10 to-pink-500/40" />

          <div className="grid justify-center gap-3">
            {grouped.map(([row, rowSeats]) => (
              <div key={row} className="flex items-center justify-center gap-3">
                <div className="w-6 text-xs text-slate-500 dark:text-white/60">{row}</div>
                <div className="flex flex-wrap gap-2">
                  {rowSeats.map((s) => {
                    const isBooked = booked.has(s.id)
                    const isSelected = selected.has(s.id)
                    return (
                      <button
                        key={s.id}
                        disabled={isBooked}
                        onClick={() => {
                          if (isBooked) return
                          const next = new Set(selected)
                          if (next.has(s.id)) next.delete(s.id)
                          else next.add(s.id)
                          setSelected(next)
                        }}
                        className={
                          'h-9 w-9 rounded-lg border text-xs transition ' +
                          (isBooked
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
                            : isSelected
                              ? 'border-indigo-400/60 bg-indigo-500/30 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-black/20 dark:text-white/70 dark:hover:bg-white/10')
                        }
                      >
                        {s.seatNumber}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div className="text-sm text-slate-600 dark:text-white/70">
              Selected: <span className="text-slate-900 dark:text-white">{selected.size}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelected(new Set())}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                type="button"
              >
                Clear
              </button>
              <button
                onClick={onReserve}
                disabled={submitting}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
                type="button"
              >
                {submitting ? 'Reserving…' : 'Reserve'}
              </button>
            </div>
          </div>

          {actionError ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}
        </div>
      </div>

      {priceCents !== null ? (
        <div className="text-xs text-slate-500 dark:text-white/50">Price per seat: ₹{(priceCents / 100).toFixed(2)}</div>
      ) : null}
    </div>
  )
}
