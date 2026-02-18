import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api'

export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = getToken()
    setTokenState(t)

    if (!t) {
      setLoading(false)
      return
    }

    api
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        setToken(null)
        setTokenState(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const res = await api.login({ email, password })
        setToken(res.token)
        setTokenState(res.token)
        setUser(res.user)
      },
      signup: async (name, email, password) => {
        const res = await api.signup({ name, email, password })
        setToken(res.token)
        setTokenState(res.token)
        setUser(res.user)
      },
      logout: () => {
        setToken(null)
        setTokenState(null)
        setUser(null)
      }
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
