import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'

export default function MovieDetailPage() {
  const params = useParams()
  const movieId = Number(params.id)

  const [movie, setMovie] = useState<Awaited<ReturnType<typeof api.movie>> | null>(null)
  const [showtimes, setShowtimes] = useState<Awaited<ReturnType<typeof api.showtimes>>>([])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = useMemo(() => date, [date])

  useEffect(() => {
    if (!Number.isFinite(movieId)) return

    setLoading(true)
    setError(null)

    Promise.all([api.movie(movieId), api.showtimes(movieId, formattedDate)])
      .then(([m, sts]) => {
        setMovie(m)
        setShowtimes(sts)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [movieId, formattedDate])

  return (
    <div className="grid gap-6">
      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      {movie ? (
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
            <div className="aspect-[2/3] w-full bg-gradient-to-br from-indigo-500/20 to-pink-500/10">
              {movie.posterUrl ? <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" /> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{movie.title}</h1>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/70">{movie.genre.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/70">{movie.description}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-2">
                <label className="text-sm text-slate-600 dark:text-white/70">Showtimes date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400/50 dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>
              <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white" to="/movies">
                ← Back to movies
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {showtimes.length === 0 ? <div className="text-sm text-slate-600 dark:text-white/70">No showtimes found for this date.</div> : null}
              {showtimes.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
                  <div className="grid gap-1">
                    <div className="text-sm font-medium">{new Date(s.startTime).toLocaleString()}</div>
                    <div className="text-xs text-slate-500 dark:text-white/60">
                      {s.auditoriumName} • ₹{(s.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                  <Link
                    to={`/showtimes/${s.id}/seats`}
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                  >
                    Select seats
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
