import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

type Movie = Awaited<ReturnType<typeof api.movies>>[number]
type Genre = Awaited<ReturnType<typeof api.genres>>[number]

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [genreId, setGenreId] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.movies(), api.genres()])
      .then(([m, g]) => {
        setMovies(m)
        setGenres(g)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (genreId === 'all') return movies
    return movies.filter((m) => m.genre.id === genreId)
  }, [movies, genreId])

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movies</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Pick a movie, choose a showtime, then reserve your seats.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-white/70">Genre</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20 dark:text-white"
            value={genreId === 'all' ? 'all' : String(genreId)}
            onChange={(e) => setGenreId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All</option>
            {genres.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Link
            key={m.id}
            to={`/movies/${m.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/10">
              {m.posterUrl ? (
                <img src={m.posterUrl} alt={m.title} className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
              ) : null}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold leading-snug">{m.title}</h2>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/70">{m.genre.name}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-white/70">{m.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
