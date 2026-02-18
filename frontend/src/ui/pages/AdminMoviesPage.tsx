import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type Movie = Awaited<ReturnType<typeof api.adminMovies>>[number]

type Genre = Awaited<ReturnType<typeof api.adminGenres>>[number]

type FormState = {
  id: number | null
  title: string
  description: string
  posterUrl: string
  genreId: string
  active: boolean
}

const emptyForm: FormState = {
  id: null,
  title: '',
  description: '',
  posterUrl: '',
  genreId: '',
  active: true
}

export default function AdminMoviesPage() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const [items, setItems] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const isEdit = useMemo(() => form.id != null, [form.id])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [g, m] = await Promise.all([api.adminGenres(), api.adminMovies()])
      setGenres(g)
      setItems(m)
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    load()
  }, [user, isAdmin])

  function startEdit(m: Movie) {
    setForm({
      id: m.id,
      title: m.title,
      description: m.description,
      posterUrl: m.posterUrl || '',
      genreId: String(m.genre.id),
      active: m.active
    })
  }

  function reset() {
    setForm(emptyForm)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const genreIdNum = Number(form.genreId)
    if (!genreIdNum) {
      setError('Please select a genre')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        posterUrl: form.posterUrl.trim() ? form.posterUrl.trim() : null,
        genreId: genreIdNum,
        active: form.active
      }

      if (isEdit && form.id != null) {
        await api.updateAdminMovie(form.id, payload)
      } else {
        await api.createAdminMovie(payload)
      }

      reset()
      await load()
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    setDeletingId(id)
    setError(null)
    try {
      await api.deleteAdminMovie(id)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">Admin movies</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Login as an admin to manage movies.</p>
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
        <h1 className="text-xl font-semibold tracking-tight">Admin movies</h1>
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
          <h1 className="text-2xl font-semibold tracking-tight">Admin movies</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Create, update, and delete movies.</p>
        </div>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-medium">{isEdit ? `Edit movie #${form.id}` : 'Create movie'}</div>
          <form className="mt-4 grid gap-3" onSubmit={submit}>
            <div className="grid gap-1">
              <label className="text-xs text-slate-500 dark:text-white/60">Title</label>
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-slate-500 dark:text-white/60">Description</label>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-slate-500 dark:text-white/60">Poster URL</label>
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
                value={form.posterUrl}
                onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs text-slate-500 dark:text-white/60">Genre</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
                value={form.genreId}
                onChange={(e) => setForm((p) => ({ ...p, genreId: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select genre
                </option>
                {genres.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/70">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              />
              Active
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
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

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-slate-200 p-4 dark:border-white/10">
            <div className="text-sm font-medium">Movies</div>
            <div className="text-xs text-slate-500 dark:text-white/60">Click a movie to edit. Delete removes it permanently.</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {items.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-4">
                <button className="text-left" onClick={() => startEdit(m)}>
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-slate-500 dark:text-white/60">
                    {m.genre.name} • {m.active ? 'Active' : 'Inactive'}
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                    onClick={() => startEdit(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                    onClick={() => remove(m.id)}
                    disabled={deletingId === m.id}
                  >
                    {deletingId === m.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && !loading ? <div className="p-4 text-sm text-slate-500 dark:text-white/60">No movies yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
