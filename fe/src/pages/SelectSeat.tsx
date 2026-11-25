import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Screen from '../components/seatComponents/Screan'
import Step from '../components/common/Step1'
import Continue from '../components/seatComponents/Continue'
import Header from '../components/common/Header'
import Content, { type ShowtimeSummary } from '../components/seatComponents/Content'
import Card from '../components/seatComponents/Card'
import { UpNote, BotNote } from '../components/seatComponents/Note'
import { Grid, type SeatData } from '../components/seatComponents/Grid'
import { SubFooter } from '../components/seatComponents/SubFooter'
import type { SeatStatus, SeatType } from '../components/seatComponents/Seat'
import { ShowtimePicker } from '../components/seatComponents/ShowtimePicker'
import type { Movie, AgeRating } from '../components/MovieComponents/MovieCard'
import { useBooking } from '../context/useBooking'
import type { ShowtimeInfo } from '../context/Booking'
import { useSeatSocket } from '../hooks/useSeatSocket'
import { useCountdown } from '../hooks/useCountdown'
import { fetchSeatMap, type SeatMapResponse, type SeatMapShowtime } from '../api/showtimes'
import type { HoldFailReason } from '../types/seatSocket'
import { resolvePoster } from '../utils/poster'

/* ------------------------------------------------------------------ */
/* Route: /booking/:showtimeId  (và /select-seat cho link cũ)           */
/* ------------------------------------------------------------------ */
const SelectSeat = () => {
  const { showtimeId: param } = useParams()
  const { showtime } = useBooking()

  // Link cũ /select-seat: dùng suất trong context nếu đó là ID thật của DB (số)
  const fromContext = showtime && /^\d+$/.test(showtime.id) ? showtime.id : undefined
  if (!param && fromContext) return <Navigate to={`/booking/${fromContext}`} replace />

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 pb-10">
      <Header />
      {param ? (
        // key: đổi suất -> mount lại toàn bộ, mọi state (ghế, đồng hồ...) tự về ban đầu
        <SeatBooking key={param} showtimeId={param} />
      ) : (
        <ShowtimePicker />
      )}
    </div>
  )
}

export default SelectSeat

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const TZ = 'Asia/Ho_Chi_Minh'

const MESSAGES: Partial<Record<HoldFailReason, string>> = {
  TAKEN: 'Sorry, someone has just taken this seat.',
  SALES_CLOSED: 'Online sales for this showtime are closed.',
  SEAT_NOT_FOUND: 'This seat does not exist in this room.',
  NOT_HELD: 'This seat is no longer held by you.',
  NO_HOLD: 'Your seat hold has expired. Please select your seats again.',
  TIMEOUT: 'The server did not respond. Please check your connection.',
  SERVER_ERROR: 'Something went wrong on the server. Please try again.',
}

const toAge = (r: SeatMapShowtime['movie']['ageRating']): AgeRating =>
  r === 'P' ? 'P' : (r.replace('T', 'C') as AgeRating)

function toShowtimeInfo(st: SeatMapShowtime): ShowtimeInfo {
  const start = new Date(st.startsAt)
  return {
    id: st.id,
    showtimeId: Number(st.id),
    // en-CA cho ra dạng YYYY-MM-DD
    dateISO: start.toLocaleDateString('en-CA', { timeZone: TZ }),
    time: start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ }),
    date: start.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', timeZone: TZ }),
    cinemaName: st.cinemaName,
    hallName: st.roomName,
    price: st.basePrice,
  }
}

function toMovie(st: SeatMapShowtime): Movie {
  return {
    id: st.movie.id,
    title: st.movie.title,
    subtitle: '',
    age: toAge(st.movie.ageRating),
    tags: [],
    genre: '',
    formats: st.format,
    rating: 0,
    poster: resolvePoster(st.movie.posterUrl) ?? '',
  }
}

/* ------------------------------------------------------------------ */
/* Trang chọn ghế của 1 suất                                           */
/* ------------------------------------------------------------------ */
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: SeatMapResponse }

function SeatBooking({ showtimeId }: { showtimeId: string }) {
  const navigate = useNavigate()
  const { movie, selectMovie, selectShowtime, syncHeldSeats } = useBooking()
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [message, setMessage] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Realtime: ghế người khác, ghế của mình, hạn giữ ghế...
  const { taken, mine, expiresAt, clockOffset, connected, pending, toggle, verify } =
    useSeatSocket(showtimeId)
  const secondsLeft = useCountdown(mine.length ? expiresAt : null, clockOffset)

  /* 1) Tải layout + giá từ database (HTTP, 1 lần) */
  useEffect(() => {
    const controller = new AbortController()
    fetchSeatMap(showtimeId, controller.signal)
      .then((data) => setLoad({ status: 'ready', data }))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setLoad({ status: 'error', message: err.message })
      })
    return () => controller.abort()
  }, [showtimeId])

  const data = load.status === 'ready' ? load.data : null

  const seatById = useMemo(() => {
    const map = new Map<string, SeatData>()
    data?.seats.forEach((s) => map.set(s.id, s))
    return map
  }, [data])

  /* 2) Đưa phim + suất (lấy từ DB) vào context cho các trang sau dùng */
  useEffect(() => {
    if (!data) return
    if (!movie || movie.title !== data.showtime.movie.title) selectMovie(toMovie(data.showtime))
    selectShowtime(toShowtimeInfo(data.showtime))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi dữ liệu suất đổi
  }, [data])

  /* 3) Context.selectedSeats = bản sao của `mine` mà server xác nhận (không có 2 nguồn sự thật) */
  useEffect(() => {
    if (!data) return
    const seats = mine.map((id) => seatById.get(id)).filter((s): s is SeatData => Boolean(s))
    syncHeldSeats(seats, expiresAt, clockOffset)
  }, [data, mine, expiresAt, clockOffset, seatById, syncHeldSeats])

  // Trạng thái hiển thị được TÍNH từ dữ liệu server, không lưu thêm state
  const statusOf = useCallback(
    (seatId: string): SeatStatus => {
      if (mine.includes(seatId)) return 'selected'
      if (taken[seatId] === 'booked') return 'unavailable'
      if (taken[seatId] === 'held') return 'held'
      return 'available'
    },
    [mine, taken]
  )

  const selectedSeats = useMemo(
    () => mine.map((id) => seatById.get(id)).filter((s): s is SeatData => Boolean(s)),
    [mine, seatById]
  )
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  const prices = useMemo(() => {
    const result: Partial<Record<SeatType, number>> = {}
    data?.seats.forEach((s) => {
      if (result[s.type] == null) result[s.type] = s.price
    })
    return result
  }, [data])

  const summary: ShowtimeSummary | null = data
    ? {
        title: data.showtime.movie.title,
        format: data.showtime.format,
        ageRating: data.showtime.movie.ageRating,
        cinemaName: data.showtime.cinemaName,
        roomName: data.showtime.roomName,
        showtimeLabel: (() => {
          const i = toShowtimeInfo(data.showtime)
          return `${i.time}, ${i.date}`
        })(),
      }
    : null

  const onToggle = async (seatId: string) => {
    if (!data?.showtime.isOnSale) {
      setMessage(MESSAGES.SALES_CLOSED ?? null)
      return
    }
    setMessage(null)
    const res = await toggle(seatId)
    if (res.ok || res.reason === 'PENDING') return
    setMessage(
      res.reason === 'LIMIT'
        ? `You can select up to ${data.rules.maxSeats} seats per order.`
        : MESSAGES[res.reason] ?? `Cannot update this seat (${res.reason}).`
    )
  }

  // FR-BK-20: hỏi lại server "các ghế này còn là của tôi không?" trước khi sang bước sau
  const onContinue = async () => {
    setVerifying(true)
    setMessage(null)
    const res = await verify()
    setVerifying(false)
    if (!res.ok) {
      setMessage(MESSAGES[res.reason] ?? `Cannot continue (${res.reason}).`)
      return
    }
    syncHeldSeats(
      res.seats.map((s) => seatById.get(s.id) ?? s),
      res.expiresAt,
      res.serverNow - Date.now()
    )
    navigate('/food')
  }

  if (load.status === 'loading') {
    return <p className="py-20 text-slate-500">Loading seat map…</p>
  }
  if (load.status === 'error') {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">Cannot load this showtime: {load.message}</p>
        <button className="mt-3 underline" onClick={() => navigate('/select-seat')}>
          Choose another showtime
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="px-10 py-5 border-4 border-[#B56100] w-306 max-w-full bg-[#F5F7FC] gap-2 flex flex-col items-center justify-start">
        <Step />
        <div className="flex gap-5 justify-around items-center w-full">
          <Card poster={movie?.poster || resolvePoster(data?.showtime.movie.posterUrl)} title={summary?.title} />
          <Content info={summary} selectedSeats={selectedSeats} totalPrice={total} secondsLeft={secondsLeft} />
          <Continue onClick={onContinue} disabled={mine.length === 0} loading={verifying} />
        </div>
      </div>

      {/* Thông báo: lỗi khi chọn ghế, mất kết nối, hết giờ bán */}
      <div className="flex w-306 max-w-full flex-col gap-2" aria-live="polite">
        {!connected && (
          <p className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Reconnecting… The seat map refreshes every few seconds until the live connection is back.
          </p>
        )}
        {data && !data.showtime.isOnSale && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{MESSAGES.SALES_CLOSED}</p>
        )}
        {message && (
          <p className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {message}
            <button className="ml-4 font-bold" onClick={() => setMessage(null)} aria-label="Dismiss">
              ×
            </button>
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-start gap-5 w-max max-w-full">
        <UpNote />
        <Screen />
        <BotNote />
      </div>
      <Grid seats={data?.seats ?? []} statusOf={statusOf} pending={pending} onToggle={onToggle} />
      <SubFooter prices={prices} />
    </>
  )
}
