import { API_URL } from '../config'
import type { SeatData } from '../components/seatComponents/Grid'
import type { TakenStatus } from '../types/seatSocket'

/** Backend luôn trả { success, data, error } (xem be/src/utils/response.js) */
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`)
  }
  return body.data as T
}

export interface SeatMapShowtime {
  id: string
  movie: {
    id: number
    title: string
    ageRating: 'P' | 'T13' | 'T16' | 'T18'
    posterUrl: string | null
    duration: number
  }
  cinemaName: string
  roomName: string
  format: string
  startsAt: number // epoch ms
  basePrice: number
  isOnSale: boolean
}

export interface SeatMapResponse {
  showtime: SeatMapShowtime
  seats: SeatData[]
  taken: Record<string, TakenStatus>
  rules: { holdMinutes: number; maxSeats: number }
}

export interface ShowtimeListItem {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  format: string
  cinemaName: string
  roomName: string
  basePrice: number
}

export const fetchSeatMap = (showtimeId: string, signal?: AbortSignal) =>
  getJson<SeatMapResponse>(`/api/showtimes/${encodeURIComponent(showtimeId)}/seat-map`, signal)

export const fetchUpcomingShowtimes = (date?: string, signal?: AbortSignal) =>
  getJson<ShowtimeListItem[]>(`/api/showtimes${date ? `?date=${date}` : ''}`, signal)
