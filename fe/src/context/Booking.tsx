import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SeatData } from '../components/seatComponents/Grid'
import type { Movie } from '../components/MovieComponents/MovieCard'
import { Socket } from '../Socket'
import { COMBOS, VIP_DISCOUNT_RATE, VOUCHERS, VAT_RATE, type Combo } from '../data/combos'
import { BookingContext } from './useBooking'

/** Suất chiếu người dùng đã chọn (hiển thị ở trang chọn ghế, thanh toán...) */
export interface ShowtimeInfo {
  id: string
  /** ShowtimeID thật trong DB — dùng cho API giữ ghế / thanh toán ở các chặng sau. */
  showtimeId: number
  time: string // 20:15
  date: string // Thursday, 24 OCT
  /** Ngày chiếu dạng YYYY-MM-DD để lọc lại lịch chiếu. */
  dateISO: string
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
  // ghế: BẢN SAO những gì server xác nhận đang giữ (nguồn sự thật nằm ở server)
  selectedIds: string[]
  selectedSeats: SeatData[]
  seatsTotal: number
  holdExpiresAt: number | null // epoch ms theo đồng hồ server
  clockOffset: number // serverNow - Date.now()
  syncHeldSeats: (seats: SeatData[], expiresAt: number | null, clockOffset: number) => void
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
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([])
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null)
  const [clockOffset, setClockOffset] = useState(0)
  const [foodQty, setFoodQtyState] = useState<Record<string, number>>({})
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER)
  const [voucher, setVoucher] = useState<string | null>(null)

  /* ---------------- phim + suất ---------------- */
  const selectMovie = useCallback(
    (m: Movie) => {
      // đổi sang phim khác thì suất chiếu và ghế cũ không còn hợp lệ
      if (m.id !== movie?.id) {
        setShowtime(null)
        setSelectedSeats([])
        setHoldExpiresAt(null)
      }
      setMovie(m)
    },
    [movie?.id]
  )

  const selectShowtime = useCallback(
    (s: ShowtimeInfo) => {
      // đổi sang suất KHÁC thì ghế cũ không thuộc sơ đồ này nữa
      // (ghế vẫn được server giữ tới hết hạn, quay lại suất cũ sẽ thấy lại)
      if (s.id !== showtime?.id) {
        setSelectedSeats([])
        setHoldExpiresAt(null)
      }
      setShowtime(s)
    },
    [showtime?.id]
  )

  /* ---------------- ghế ---------------- */
  // Trang chọn ghế gọi hàm này mỗi khi server trả về danh sách ghế đang giữ
  const syncHeldSeats = useCallback(
    (seats: SeatData[], expiresAt: number | null, offset: number) => {
      setSelectedSeats(seats)
      setHoldExpiresAt(seats.length ? expiresAt : null)
      setClockOffset(offset)
    },
    []
  )

  const clearSeats = useCallback(() => {
    setSelectedSeats([])
    setHoldExpiresAt(null)
  }, [])

  // Hết giờ giữ ghế có thể xảy ra khi người dùng đang ở trang Food/Payment
  // -> nghe ở Provider (luôn mounted) thay vì ở trang chọn ghế.
  const showtimeIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    showtimeIdRef.current = showtime?.id
  }, [showtime?.id])

  useEffect(() => {
    const onExpired = ({ showtimeId }: { showtimeId: string }) => {
      if (showtimeId !== showtimeIdRef.current) return
      setSelectedSeats([])
      setHoldExpiresAt(null)
      window.alert('Your seat hold has expired. Please select your seats again.')
    }
    Socket.on('hold-expired', onExpired)
    return () => {
      Socket.off('hold-expired', onExpired)
    }
  }, [])

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
    setSelectedSeats([])
    setHoldExpiresAt(null)
    setFoodQtyState({})
    setCustomer(EMPTY_CUSTOMER)
    setVoucher(null)
  }, [])

  /* ---------------- dữ liệu suy ra (derived state) ---------------- */
  const selectedIds = useMemo(() => selectedSeats.map(seat => seat.id), [selectedSeats])

  // Giá từng ghế do server tính (giá suất + phụ thu loại ghế), client chỉ cộng lại để hiển thị
  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
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
      selectedIds, selectedSeats, seatsTotal, holdExpiresAt, clockOffset, syncHeldSeats, clearSeats,
      foodQty, foodItems, setFoodQty, clearFood,
      customer, updateCustomer, voucher, applyVoucher, removeVoucher,
      totals, reset,
    }),
    [movie, showtime, selectMovie, selectShowtime,
     selectedIds, selectedSeats, seatsTotal, holdExpiresAt, clockOffset, syncHeldSeats, clearSeats,
     foodQty, foodItems, setFoodQty, clearFood,
     customer, updateCustomer, voucher, applyVoucher, removeVoucher,
     totals, reset]
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
