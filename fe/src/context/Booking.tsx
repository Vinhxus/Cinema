import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { seats } from '../data/seats'
import type { SeatData } from '../components/seatComponents/Grid'
import type { Movie } from '../components/MovieComponents/MovieCard'
import { Price } from '../data/Price'
import { COMBOS, VIP_DISCOUNT_RATE, VOUCHERS, VAT_RATE, type Combo } from '../data/combos'
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

/** Thông tin người nhận vé (form ở trang Payment) */
export interface CustomerInfo {
  fullName: string
  phone: string
  email: string
}

/** Một dòng combo trong giỏ: combo nào, bao nhiêu phần */
export interface FoodLine {
  combo: Combo
  qty: number
}

/** Toàn bộ con số tiền — tính MỘT chỗ duy nhất, mọi trang chỉ việc đọc */
export interface BookingTotals {
  seats: number // tiền ghế
  fb: number // tiền bắp nước (F&B)
  vipDiscount: number // giảm 10% trên F&B
  subtotal: number // seats + fb - vipDiscount (trang Food hiển thị số này)
  voucherDiscount: number // giảm từ mã voucher (áp ở trang Payment)
  total: number // số tiền phải trả cuối cùng
  vat: number // phần VAT nằm sẵn trong total
  points: number // CinePoints được cộng
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
  // bắp nước
  foodQty: Record<string, number>
  foodItems: FoodLine[]
  setFoodQty: (comboId: string, qty: number) => void
  clearFood: () => void
  // khách hàng + voucher
  customer: CustomerInfo
  updateCustomer: (patch: Partial<CustomerInfo>) => void
  voucher: string | null
  applyVoucher: (code: string) => boolean // trả về true nếu mã hợp lệ
  removeVoucher: () => void
  // tiền
  totals: BookingTotals
  // xóa toàn bộ đơn (sau khi thanh toán)
  reset: () => void
}

const EMPTY_CUSTOMER: CustomerInfo = { fullName: '', phone: '', email: '' }

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtime, setShowtime] = useState<ShowtimeInfo | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [foodQty, setFoodQtyState] = useState<Record<string, number>>({})
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER)
  const [voucher, setVoucher] = useState<string | null>(null)

  /* ---------------- phim + suất ---------------- */
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

  /* ---------------- ghế ---------------- */
  const toggleSeat = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }, [])

  const clearSeats = useCallback(() => setSelectedIds([]), [])

  /* ---------------- bắp nước ---------------- */
  const setFoodQty = useCallback((comboId: string, qty: number) => {
    setFoodQtyState(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[comboId] // về 0 thì bỏ hẳn khỏi giỏ cho gọn
      else next[comboId] = qty
      return next
    })
  }, [])

  const clearFood = useCallback(() => setFoodQtyState({}), [])

  /* ---------------- khách hàng + voucher ---------------- */
  const updateCustomer = useCallback((patch: Partial<CustomerInfo>) => {
    setCustomer(prev => ({ ...prev, ...patch }))
  }, [])

  const applyVoucher = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase()
    if (!(normalized in VOUCHERS)) return false
    setVoucher(normalized)
    return true
  }, [])

  const removeVoucher = useCallback(() => setVoucher(null), [])

  const reset = useCallback(() => {
    setMovie(null)
    setShowtime(null)
    setSelectedIds([])
    setFoodQtyState({})
    setCustomer(EMPTY_CUSTOMER)
    setVoucher(null)
  }, [])

  /* ---------------- dữ liệu suy ra (derived state) ---------------- */
  const selectedSeats = useMemo(
    () => seats.filter(seat => selectedIds.includes(seat.id)),
    [selectedIds]
  )

  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + Price[seat.type], 0),
    [selectedSeats]
  )

  const foodItems = useMemo<FoodLine[]>(
    () =>
      COMBOS.filter(c => (foodQty[c.id] ?? 0) > 0).map(c => ({
        combo: c,
        qty: foodQty[c.id],
      })),
    [foodQty]
  )

  const totals = useMemo<BookingTotals>(() => {
    const fb = foodItems.reduce((sum, { combo, qty }) => sum + combo.price * qty, 0)
    const vipDiscount = Math.round(fb * VIP_DISCOUNT_RATE)
    const subtotal = seatsTotal + fb - vipDiscount
    // không cho voucher giảm quá số tiền đang có
    const voucherDiscount = voucher ? Math.min(VOUCHERS[voucher] ?? 0, subtotal) : 0
    const total = subtotal - voucherDiscount
    // giá đã gồm VAT -> phần VAT = total * 8 / 108
    const vat = Math.round((total * VAT_RATE) / (1 + VAT_RATE))
    return {
      seats: seatsTotal,
      fb,
      vipDiscount,
      subtotal,
      voucherDiscount,
      total,
      vat,
      points: Math.floor(total / 10000),
    }
  }, [foodItems, seatsTotal, voucher])

  const value = useMemo<BookingContextValue>(
    () => ({
      movie, showtime, selectMovie, selectShowtime,
      selectedIds, selectedSeats, seatsTotal, toggleSeat, clearSeats,
      foodQty, foodItems, setFoodQty, clearFood,
      customer, updateCustomer, voucher, applyVoucher, removeVoucher,
      totals, reset,
    }),
    [movie, showtime, selectMovie, selectShowtime,
     selectedIds, selectedSeats, seatsTotal, toggleSeat, clearSeats,
     foodQty, foodItems, setFoodQty, clearFood,
     customer, updateCustomer, voucher, applyVoucher, removeVoucher,
     totals, reset]
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
