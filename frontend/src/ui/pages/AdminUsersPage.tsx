import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type AdminUser = Awaited<ReturnType<typeof api.adminUsers>>[number]

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.adminUsers()
      setItems(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load users')
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

  async function promote(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await api.promoteUser(id)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Promote failed')
    } finally {
      setBusyId(null)
    }
  }

  async function demote(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await api.demoteUser(id)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Demote failed')
    } finally {
      setBusyId(null)
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h1 className="text-xl font-semibold tracking-tight">Admin users</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">Login as an admin to manage users.</p>
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
        <h1 className="text-xl font-semibold tracking-tight">Admin users</h1>
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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70">Promote users to admin (super admin only).</p>
        </div>
      </div>

      {loading ? <div className="text-slate-600 dark:text-white/70">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto dark:border-white/10 dark:bg-white/5">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-slate-500 dark:text-white/60">
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b border-slate-200 last:border-b-0 dark:border-white/10">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-white/70">{u.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-white/70">{u.role}</td>
                <td className="px-4 py-3">
                  {!isSuperAdmin ? (
                    <span className="text-xs text-slate-400 dark:text-white/50">—</span>
                  ) : u.role === 'USER' ? (
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                      onClick={() => promote(u.id)}
                      disabled={busyId === u.id}
                    >
                      {busyId === u.id ? 'Promoting…' : 'Promote'}
                    </button>
                  ) : u.role === 'ADMIN' ? (
                    <button
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                      onClick={() => demote(u.id)}
                      disabled={busyId === u.id}
                    >
                      {busyId === u.id ? 'Demoting…' : 'Demote'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-white/50">—</span>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-white/60" colSpan={4}>
                  No users.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
