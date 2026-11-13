import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { seats } from '../data/seats'
import type { SeatData } from '../components/seatComponents/Grid'
import type { Movie } from '../components/MovieComponents/MovieCard' 
import { Price } from '../data/Price'
import { BookingContext } from './useBooking'

/** Suất chiếu người dùng đã chọn (hiển thị ở trang chọn ghế, thanh toán...) */
export interface ShowtimeInfo {
  id: string
  time: string // 20:15
  date: string // Thursday, 24 OCT
  cinemaName: string
  hallName: string
  price: number // giá vé gốc của suất
}

export interface BookingContextValue {
  // phim + suất chiếu
  movie: Movie | null
  showtime: ShowtimeInfo | null
  selectMovie: (movie: Movie) => void
  selectShowtime: (showtime: ShowtimeInfo) => void
  // ghế
  selectedIds: string[]
  selectedSeats: SeatData[]
  seatsTotal: number
  toggleSeat: (id: string) => void
  clearSeats: () => void
  // xóa toàn bộ đơn (sau khi thanh toán)
  reset: () => void
}

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtime, setShowtime] = useState<ShowtimeInfo | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const selectMovie = useCallback(
    (m: Movie) => {
      // đổi sang phim khác thì suất chiếu và ghế cũ không còn hợp lệ
      if (m.id !== movie?.id) {
        setShowtime(null)
        setSelectedIds([])
      }
      setMovie(m)
    },
    [movie?.id]
  )

  const selectShowtime = useCallback((s: ShowtimeInfo) => {
    setShowtime(s)
    setSelectedIds([]) // đổi suất thì sơ đồ ghế khác nên reset
  }, [])

  const toggleSeat = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }, [])

  const clearSeats = useCallback(() => setSelectedIds([]), [])

  const reset = useCallback(() => {
    setMovie(null)
    setShowtime(null)
    setSelectedIds([])
  }, [])

  const selectedSeats = useMemo(
    () => seats.filter(seat => selectedIds.includes(seat.id)),
    [selectedIds]
  )

  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + Price[seat.type], 0),
    [selectedSeats]
  )

  const value = useMemo<BookingContextValue>(
    () => ({
      movie, showtime, selectMovie, selectShowtime,
      selectedIds, selectedSeats, seatsTotal,
      toggleSeat, clearSeats, reset,
    }),
    [movie, showtime, selectMovie, selectShowtime,
     selectedIds, selectedSeats, seatsTotal, toggleSeat, clearSeats, reset]
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}