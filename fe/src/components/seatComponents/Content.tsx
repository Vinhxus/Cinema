import type { SeatData } from './Grid'
import type { AgeRating } from '../MovieComponents/MovieCard'
import { useBooking } from '../../context/useBooking'
import { AGE_LABEL } from '../../data/movieDetail'

interface ContentProps {
  selectedSeats: SeatData[]
  totalPrice: number
}

const AGE_STYLE: Record<AgeRating, string> = {
  P: 'bg-emerald-600',
  C13: 'bg-amber-500',
  C16: 'bg-orange-500',
  C18: 'bg-red-600',
}

const lineClass =
  "text-black text-base font-normal font-['Space_Grotesk'] leading-6"

const Content = ({ selectedSeats, totalPrice }: ContentProps) => {
  // Phim + suất chiếu lấy từ BookingContext (đã lưu từ MovieCard / MovieDetail)
  const { movie, showtime } = useBooking()

  const seatText = selectedSeats.length
    ? selectedSeats.map(s => s.label).join(', ')
    : '—'

  return (
    <div className="flex w-215 max-w-full items-center justify-between gap-6">
      {/* Phim */}
      <div className="flex w-48 shrink-0 flex-col items-start">
        <div
          title={movie?.title}
          className="w-full truncate text-black text-xl font-bold font-['Space_Grotesk'] uppercase leading-6"
        >
          {movie?.title ?? '—'}
        </div>
        <div className={`w-full truncate ${lineClass}`}>{movie?.formats ?? '—'}</div>
        {movie && (
          <div
            className={`mt-0.5 rounded px-2 py-0.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-white text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide ${AGE_STYLE[movie.age]}`}
          >
            {AGE_LABEL[movie.age]}
          </div>
        )}
      </div>

      {/* Suất chiếu + ghế + giá */}
      <div className="flex min-w-0 flex-1 items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={lineClass}>Cinema: {showtime?.cinemaName ?? '—'}</div>
          <div className={lineClass}>
            Showtime: {showtime ? `${showtime.time}, ${showtime.date}` : '—'}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={lineClass}>Room: {showtime?.hallName ?? '—'}</div>
          <div className={`break-words ${lineClass}`}>Seat: {seatText}</div>
          <div className={lineClass}>
            Price: {totalPrice.toLocaleString('vi-VN')} vnđ
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content