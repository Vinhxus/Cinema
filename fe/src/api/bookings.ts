import { API_URL } from '../config'
import { getClientId } from '../utils/clientId'

interface ApiEnvelope<T> {
  success: boolean
  data: T | null
  error: { message: string } | null
}

// Khách chưa đăng nhập -> "danh tính" là clientId trong localStorage, gửi qua header X-Client-Id.
// Server chỉ trả đơn có session_id trùng clientId này.
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'X-Client-Id': getClientId() },
  })
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || !body?.success || body.data == null) {
    throw new Error(body?.error?.message ?? `Server error (${res.status})`)
  }
  return body.data
}

export type BookingStatus = 'PAID' | 'REFUNDED' | 'NEED_SUPPORT' | string

export interface BookingSummary {
  bookingCode: string
  status: BookingStatus
  createdAt: string // "2026-11-27 17:11"
  movie: { id: number; title: string; posterUrl: string | null; ageRating: string; duration: number }
  showtime: { date: string; startTime: string; endTime: string; format: string }
  cinema: { name: string; branch: string | null; address: string; room: string }
  amounts: { seats: number; fb: number; discount: number; total: number }
}

export interface BookingHistoryItem extends BookingSummary {
  seatLabels: string[]
  ticketCount: number
}

export interface TicketInfo {
  ticketNo: string
  seatLabel: string
  seatType: string
  price: number
  barcode: string
  gate: string
  status: 'VALID' | 'USED' | 'CANCELED' | 'REFUNDED'
  qrDataUrl: string // ảnh QR (base64) do server sinh từ JWT của vé
}

export interface BookingDetail extends BookingSummary {
  customer: { name: string; email: string; phone: string }
  payment: {
    transactionRef: string
    partner: string
    method: string
    amount: number
    status: string
    paidAt: string | null
  } | null
  tickets: TicketInfo[]
}

export const getBookingHistory = () => get<BookingHistoryItem[]>('/bookings/history')
export const getBookingDetail = (code: string) => get<BookingDetail>(`/bookings/${encodeURIComponent(code)}`)

/* ---------- format dùng chung cho 2 trang vé ---------- */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-12-02" -> "Wed, Dec 2, 2026" (tự tách chuỗi, không qua new Date(iso) để khỏi lệch múi giờ) */
export function formatShowDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}`
}

/** Suất chiếu đã qua chưa (tính theo giờ kết thúc) */
export function isPastShow(date: string, endTime: string): boolean {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = endTime.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm).getTime() < Date.now()
}

export const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  PAID: { text: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  REFUNDED: { text: 'Refunded', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  NEED_SUPPORT: { text: 'Needs support', className: 'bg-amber-50 text-amber-700 border-amber-300' },
  USED: { text: 'Checked in', className: 'bg-gray-100 text-gray-600 border-gray-300' },
}
