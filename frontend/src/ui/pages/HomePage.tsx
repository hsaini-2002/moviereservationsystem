export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-3xl font-semibold tracking-tight">Reserve your seats in seconds</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-white/70">
          This is the starter UI. Next we’ll add authentication, movie browsing, showtimes, and the interactive seat
          picker.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/70">
            Backend health: <span className="text-slate-900 dark:text-white">/api/health</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/70">
            Frontend proxy: <span className="text-slate-900 dark:text-white">Vite → Spring Boot</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/10" />
            <div className="mt-4">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 dark:bg-white/5" />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
