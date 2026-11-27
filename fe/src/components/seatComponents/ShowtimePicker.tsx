import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchUpcomingShowtimes, type ShowtimeListItem } from '../../api/showtimes'
import { vnd } from '../../utils/currency'

/**
 * Hiện khi vào trang chọn ghế mà chưa có ShowtimeID thật từ database
 * (trang chi tiết phim hiện vẫn dùng dữ liệu mock).
 * Khi module Movie Discovery lấy suất chiếu từ API, chỉ cần navigate(`/booking/${id}`).
 */
export const ShowtimePicker = () => {
  const [items, setItems] = useState<ShowtimeListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchUpcomingShowtimes(undefined, controller.signal)
      .then(setItems)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
    return () => controller.abort()
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-['Space_Grotesk'] text-lg font-bold">Choose a showtime</h2>
      <p className="mt-1 text-sm text-slate-500">
        No showtime from the database is selected yet. Pick one below to open its seat map.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">Cannot load showtimes: {error}</p>}
      {!items && !error && <p className="mt-4 text-sm text-slate-400">Loading…</p>}
      {items?.length === 0 && <p className="mt-4 text-sm text-slate-400">No showtimes on sale.</p>}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items?.map((st) => (
          <li key={st.id}>
            <Link
              to={`/booking/${st.id}`}
              className="block rounded-lg border border-slate-200 px-4 py-3 transition hover:border-amber-400 hover:bg-amber-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{st.time}</span>
                <span className="text-xs text-slate-500">{st.date}</span>
              </div>
              <div className="truncate text-sm font-semibold">{st.title}</div>
              <div className="truncate text-xs text-slate-500">
                {st.cinemaName} • {st.roomName} • {st.format} • from {vnd(st.basePrice)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
