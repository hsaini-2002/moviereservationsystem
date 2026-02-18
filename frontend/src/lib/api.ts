export type ApiError = {
  error: string
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

const TOKEN_KEY = 'mrs_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const method = init?.method || 'GET'
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, { ...init, headers })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    let detail = 'Request failed'
    if (typeof body === 'object' && body) {
      if ('error' in body && (body as any).error) detail = String((body as any).error)
      else if ('message' in body && (body as any).message) detail = String((body as any).message)
    } else if (typeof body === 'string' && body.trim()) {
      detail = body
    }

    const statusText = res.statusText || ''
    const prefix = `${res.status} ${method} ${path}`
    const suffix = statusText ? `: ${statusText}` : ''
    throw new Error(`${prefix}${suffix} — ${detail}`)
  }

  return body as T
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: number; name: string; email: string; role: string } }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: { id: number; name: string; email: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  me: () => request<{ id: number; name: string; email: string; role: string }>('/api/me'),

  genres: () => request<Array<{ id: number; name: string }>>('/api/genres'),

  movies: () => request<Array<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>>('/api/movies'),

  movie: (id: number) => request<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>(`/api/movies/${id}`),

  showtimes: (movieId: number, date: string) =>
    request<
      Array<{
        id: number
        movieId: number
        auditoriumId: number
        auditoriumName: string
        startTime: string
        endTime: string
        priceCents: number
      }>
    >(`/api/movies/${movieId}/showtimes?date=${encodeURIComponent(date)}`),

  showtime: (id: number) =>
    request<{
      id: number
      movieId: number
      movieTitle: string
      auditoriumId: number
      auditoriumName: string
      startTime: string
      endTime: string
      priceCents: number
    }>(`/api/showtimes/${id}`),

  seats: (showtimeId: number) =>
    request<{ showtimeId: number; auditoriumId: number; auditoriumName: string; seats: Array<{ id: number; rowLabel: string; seatNumber: number }> }>(
      `/api/showtimes/${showtimeId}/seats`
    ),

  availability: (showtimeId: number) => request<{ showtimeId: number; bookedSeatIds: number[] }>(`/api/showtimes/${showtimeId}/availability`),

  reserve: (showtimeId: number, seatIds: number[]) =>
    request<{ id: number; showtimeId: number; status: string; totalAmountCents: number; createdAt: string; seatIds: number[]; seatLabels: string[] }>(
      `/api/showtimes/${showtimeId}/reservations`,
      { method: 'POST', body: JSON.stringify({ seatIds }) }
    ),

  myReservations: () =>
    request<
      Array<{
        id: number
        showtimeId: number
        movieTitle: string
        auditoriumName: string
        showtimeStartTime: string
        showtimeEndTime: string
        status: string
        totalAmountCents: number
        createdAt: string
        seatIds: number[]
        seatLabels: string[]
      }>
    >(
      '/api/reservations/mine'
    ),

  cancelReservation: (id: number) => request<void>(`/api/reservations/${id}`, { method: 'DELETE' }),

  adminReportSummary: (date: string) =>
    request<{
      date: string
      totalReservations: number
      confirmedReservations: number
      cancelledReservations: number
      totalRevenueCents: number
      confirmedSeats: number
      cancelledSeats: number
      totalSeatsCapacity: number
      occupancyRate: number
    }>(
      `/api/admin/reports/summary?date=${encodeURIComponent(date)}`
    ),

  adminReportShowtimes: (date: string) =>
    request<{
      date: string
      showtimes: Array<{
        showtimeId: number
        movieId: number
        movieTitle: string
        auditoriumId: number
        auditoriumName: string
        startTime: string
        endTime: string
        priceCents: number
        capacity: number
        bookedSeats: number
        revenueCents: number
      }>
    }>(`/api/admin/reports/showtimes?date=${encodeURIComponent(date)}`),

  adminUsers: () => request<Array<{ id: number; name: string; email: string; role: string; createdAt: string | null }>>('/api/admin/users'),
  promoteUser: (id: number) => request<{ id: number; name: string; email: string; role: string; createdAt: string | null }>(`/api/admin/users/${id}/promote`, { method: 'POST' }),
  demoteUser: (id: number) => request<{ id: number; name: string; email: string; role: string; createdAt: string | null }>(`/api/admin/users/${id}/demote`, { method: 'POST' }),

  adminGenres: () => request<Array<{ id: number; name: string }>>('/api/admin/genres'),
  adminMovies: () =>
    request<Array<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>>('/api/admin/movies'),
  adminMovie: (id: number) =>
    request<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>(`/api/admin/movies/${id}`),
  createAdminMovie: (payload: { title: string; description: string; posterUrl: string | null; genreId: number; active: boolean }) =>
    request<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>(
      '/api/admin/movies',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  updateAdminMovie: (id: number, payload: { title: string; description: string; posterUrl: string | null; genreId: number; active: boolean }) =>
    request<{ id: number; title: string; description: string; posterUrl: string | null; active: boolean; genre: { id: number; name: string } }>(
      `/api/admin/movies/${id}`,
      { method: 'PUT', body: JSON.stringify(payload) }
    ),
  deleteAdminMovie: (id: number) => request<void>(`/api/admin/movies/${id}`, { method: 'DELETE' }),

  adminCreateShowtime: (payload: { movieId: number; auditoriumId: number; startTime: string; endTime: string; priceCents: number }) =>
    request<{ id: number; movieId: number; auditoriumId: number; auditoriumName: string; startTime: string; endTime: string; priceCents: number }>(
      '/api/admin/showtimes',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  adminUpdateShowtime: (id: number, payload: { movieId: number; auditoriumId: number; startTime: string; endTime: string; priceCents: number }) =>
    request<{ id: number; movieId: number; auditoriumId: number; auditoriumName: string; startTime: string; endTime: string; priceCents: number }>(
      `/api/admin/showtimes/${id}`,
      { method: 'PUT', body: JSON.stringify(payload) }
    ),
  adminShowtimes: () =>
    request<Array<{ id: number; movieId: number; auditoriumId: number; auditoriumName: string; startTime: string; endTime: string; priceCents: number }>>(
      '/api/admin/showtimes'
    ),
  adminDeleteShowtime: (id: number) => request<void>(`/api/admin/showtimes/${id}`, { method: 'DELETE' })
}
