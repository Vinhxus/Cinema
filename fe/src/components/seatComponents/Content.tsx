import type { SeatData } from './Grid'
import { formatMmSs } from '../../hooks/useCountdown'

export interface ShowtimeSummary {
  title: string
  format: string
  ageRating: string // 'P' | 'T13' | 'T16' | 'T18' (theo DB)
  cinemaName: string
  roomName: string
  showtimeLabel: string // "20:15, Thứ Ba 24/11"
}

interface ContentProps {
  info: ShowtimeSummary | null
  selectedSeats: SeatData[]
  totalPrice: number
  secondsLeft: number | null // null = chưa giữ ghế nào
}

const AGE_STYLE: Record<string, string> = {
  P: 'bg-emerald-600',
  T13: 'bg-amber-500',
  T16: 'bg-orange-500',
  T18: 'bg-red-600',
}

const lineClass =
  "text-black text-base font-normal font-['Space_Grotesk'] leading-6"

const Content = ({ info, selectedSeats, totalPrice, secondsLeft }: ContentProps) => {
  const seatText = selectedSeats.length
    ? selectedSeats.map(s => s.label).join(', ')
    : '—'

  return (
    <div className="flex w-215 max-w-full items-center justify-between gap-6">
      {/* Phim */}
      <div className="flex w-48 shrink-0 flex-col items-start">
        <div
          title={info?.title}
          className="w-full truncate text-black text-xl font-bold font-['Space_Grotesk'] uppercase leading-6"
        >
          {info?.title ?? '—'}
        </div>
        <div className={`w-full truncate ${lineClass}`}>{info?.format ?? '—'}</div>
        {info && (
          <div
            className={`mt-0.5 rounded px-2 py-0.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-white text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide ${AGE_STYLE[info.ageRating] ?? 'bg-slate-500'}`}
          >
            {info.ageRating}
          </div>
        )}
      </div>

      {/* Suất chiếu + ghế + giá */}
      <div className="flex min-w-0 flex-1 items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={lineClass}>Cinema: {info?.cinemaName ?? '—'}</div>
          <div className={lineClass}>Showtime: {info?.showtimeLabel ?? '—'}</div>
          {secondsLeft != null && (
            <div
              className={`font-['Space_Grotesk'] text-base font-bold leading-6 ${
                secondsLeft < 60 ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              Holding seats: {formatMmSs(secondsLeft)}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={lineClass}>Room: {info?.roomName ?? '—'}</div>
          <div className={`break-words ${lineClass}`}>Seat: {seatText}</div>
          <div className={lineClass}>
            Price: {totalPrice.toLocaleString('en-US')} ₫
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
