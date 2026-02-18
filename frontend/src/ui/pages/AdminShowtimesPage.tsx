import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type Movie = Awaited<ReturnType<typeof api.adminMovies>>[number]
type Showtime = Awaited<ReturnType<typeof api.adminShowtimes>>[number]

type FormState = {
  id: number | null
  movieId: string
  auditoriumId: string
  startTime: string
  endTime: string
  priceRupees: string
}

const emptyForm: FormState = {
  id: null,
  movieId: '',
  auditoriumId: '',
  startTime: new Date().toISOString().slice(0, 16),
  endTime: new Date().toISOString().slice(0, 16),
  priceRupees: '250.00'
}

export default function AdminShowtimesPage() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)

  const isEdit = useMemo(() => form.id != null, [form.id])

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([api.adminMovies(), api.adminShowtimes()])
      .then(([ms, sts]) => {
        setMovies(ms)
        setShowtimes(sts)
      })
      .catch((e: any) => setError(e?.message || 'Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [user, isAdmin])

  async function refreshShowtimes() {
    const sts = await api.adminShowtimes()
    setShowtimes(sts)
  }

  function reset() {
    setForm(emptyForm)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const movieId = Number(form.movieId)
    const auditoriumId = Number(form.auditoriumId)
    const rupees = Number(form.priceRupees)

    if (!movieId || !auditoriumId) {
      setError('Movie and auditorium are required')
      return
    }

    if (!form.startTime || !form.endTime) {
      setError('Start and end time are required')
      return
    }

    setSaving(true)
    try {
      const priceCents = Number.isFinite(rupees) ? Math.round(rupees * 100) : 0
      const payload = {
        movieId,
        auditoriumId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        priceCents
      }

      if (isEdit && form.id != null) {
        await api.adminUpdateShowtime(form.id, payload)
      } else {
        await api.adminCreateShowtime(payload)
      }

      await refreshShowtimes()
      reset()
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(s: Showtime) {
    setError(null)
    setForm({
      id: s.id,
      movieId: String(s.movieId),
      auditoriumId: String(s.auditoriumId),
      startTime: new Date(s.startTime).toISOString().slice(0, 16),
      endTime: new Date(s.endTime).toISOString().slice(0, 16),
      priceRupees: (s.priceCents / 100).toFixed(2)
    })
  }

  async function removeShowtime(id: number) {
    setError(null)
    setDeletingId(id)
    try {
      await api.adminDeleteShowtime(id)
      if (form.id === id) {
        reset()
      }
      await refreshShowtimes()
    } catch (e: any) {
      setError(e?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">Admin showtimes</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Login as an admin to manage showtimes.</p>
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
        <h1 className="text-xl font-semibold tracking-tight">Admin showtimes</h1>
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin showtimes</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Create and update showtimes.</p>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="text-sm font-medium">{isEdit ? `Edit showtime #${form.id}` : 'Create showtime'}</div>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submit}>
          <div className="grid gap-1">
            <label className="text-xs text-slate-500 dark:text-white/60">Movie</label>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
              value={form.movieId}
              onChange={(e) => setForm((p) => ({ ...p, movieId: e.target.value }))}
              required
            >
              <option value="" disabled>
                Select movie
              </option>
              {movies.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-500 dark:text-white/60">Auditorium ID</label>
            <input
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
              value={form.auditoriumId}
              onChange={(e) => setForm((p) => ({ ...p, auditoriumId: e.target.value }))}
              placeholder="1"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-500 dark:text-white/60">Start time</label>
            <input
              type="datetime-local"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-500 dark:text-white/60">End time</label>
            <input
              type="datetime-local"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-500 dark:text-white/60">Price (₹)</label>
            <input
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
              value={form.priceRupees}
              onChange={(e) => setForm((p) => ({ ...p, priceRupees: e.target.value }))}
              placeholder="250.00"
              required
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>

            {isEdit ? (
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                type="button"
                onClick={reset}
                disabled={saving}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="text-sm font-medium">Existing showtimes</div>

        {showtimes.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-white/70">No showtimes yet.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 dark:text-white/60">
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Movie</th>
                  <th className="py-2 pr-3">Auditorium</th>
                  <th className="py-2 pr-3">Start</th>
                  <th className="py-2 pr-3">End</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2 pr-3 font-mono text-xs text-slate-700 dark:text-white/80">{s.id}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-white/80">
                      {movies.find((m) => m.id === s.movieId)?.title ?? `#${s.movieId}`}
                    </td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-white/80">
                      {s.auditoriumName} (#{s.auditoriumId})
                    </td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-white/80">{new Date(s.startTime).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-white/80">{new Date(s.endTime).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-white/80">₹{(s.priceCents / 100).toFixed(2)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                          type="button"
                          onClick={() => startEdit(s)}
                          disabled={saving || deletingId != null}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                          type="button"
                          onClick={() => removeShowtime(s.id)}
                          disabled={saving || deletingId === s.id}
                        >
                          {deletingId === s.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
