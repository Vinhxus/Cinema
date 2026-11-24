// "Hợp đồng" giữa FE và BE cho trang chọn ghế.
// Khai báo kiểu cho từng event -> gõ sai tên event hay sai payload là TypeScript báo lỗi ngay.
import type { SeatType } from '../components/seatComponents/Seat'

/** Ghế của người KHÁC: đang giữ hoặc đã bán */
export type TakenStatus = 'held' | 'booked'

export type HoldFailReason =
  | 'SHOWTIME_NOT_FOUND'
  | 'SALES_CLOSED'
  | 'SEAT_NOT_FOUND'
  | 'TAKEN'
  | 'LIMIT'
  | 'NOT_HELD'
  | 'NO_HOLD'
  | 'INVALID_PAYLOAD'
  | 'SERVER_ERROR'
  | 'TIMEOUT'

export type Fail = { ok: false; reason: HoldFailReason }

export type JoinAck =
  | {
      ok: true
      taken: Record<string, TakenStatus>
      mine: string[]
      expiresAt: number | null
      serverNow: number
    }
  | Fail

export type HoldAck =
  | { ok: true; mine: string[]; expiresAt: number | null; serverNow: number }
  | Fail

export interface HeldSeat {
  id: string
  row: string
  number: number
  label: string
  type: SeatType
  price: number
}

export type VerifyAck =
  | {
      ok: true
      bookingCode: string
      seats: HeldSeat[]
      seatsTotal: number
      expiresAt: number
      serverNow: number
    }
  | Fail

export interface SeatUpdate {
  showtimeId: string
  seatIds: string[]
  status: TakenStatus | 'available'
}

export interface MyHolds {
  showtimeId: string
  mine: string[]
  expiresAt: number | null
}

export interface ChatMessage {
  id: string
  text: string
  time: number
}

export interface ServerToClientEvents {
  'seat-update': (u: SeatUpdate) => void
  'my-holds': (p: MyHolds) => void
  'hold-expired': (p: { showtimeId: string }) => void
  'chat-message': (m: ChatMessage) => void
}

export interface ClientToServerEvents {
  'join-showtime': (p: { showtimeId: string }, ack: (r: JoinAck) => void) => void
  'leave-showtime': (p: { showtimeId: string }) => void
  'hold-seat': (p: { showtimeId: string; seatId: string }, ack: (r: HoldAck) => void) => void
  'release-seat': (p: { showtimeId: string; seatId: string }, ack: (r: HoldAck) => void) => void
  'verify-hold': (p: { showtimeId: string }, ack: (r: VerifyAck) => void) => void
  'chat-message': (text: string) => void
}
