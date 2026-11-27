import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Ticket, Loader2, Armchair } from 'lucide-react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import {
  getBookingHistory,
  formatShowDate,
  isPastShow,
  STATUS_LABEL,
  type BookingHistoryItem,
} from '../api/bookings'
import { resolvePoster } from '../utils/poster'
import { vnd } from '../utils/currency'

export default function BookingHistory() {
  const [items, setItems] = useState<BookingHistoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getBookingHistory()
      .then((data) => !cancelled && setItems(data))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load your booking history'))
    return () => {
      cancelled = true
    }
  }, [])

  // Tách suất sắp chiếu / đã chiếu để khách thấy vé cần dùng trước
  const upcoming = items?.filter((b) => !isPastShow(b.showtime.date, b.showtime.endTime)) ?? []
  const past = items?.filter((b) => isPastShow(b.showtime.date, b.showtime.endTime)) ?? []

  return (
    <div className="min-h-screen bg-white flex flex-col pay-font-primary pay-text-primary">
      <div className="w-full border-b border-gray-100">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-[#e50914]" />
          <h1 className="text-2xl font-bold">Booking History</h1>
        </div>

        {!items && !error && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {items && items.length === 0 && (
          <div className="pay-card border border-gray-300 rounded-2xl p-10 text-center space-y-3">
            <p className="text-sm pay-text-secondary">You have no tickets on this browser yet.</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold"
            >
              Book now
            </Link>
          </div>
        )}

        {upcoming.length > 0 && <Section title="Upcoming" items={upcoming} />}
        {past.length > 0 && <Section title="Past" items={past} dimmed />}

        {items && items.length > 0 && (
          <p className="text-[11px] pay-text-secondary">
            History is stored per browser. Switching devices or clearing browser data will hide past tickets.
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, items, dimmed = false }: { title: string; items: BookingHistoryItem[]; dimmed?: boolean }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider pay-text-secondary">
        {title} ({items.length})
      </h2>
      <div className="space-y-3">
        {items.map((b) => (
          <BookingCard key={b.bookingCode} booking={b} dimmed={dimmed} />
        ))}
      </div>
    </section>
  )
}

function BookingCard({ booking: b, dimmed }: { booking: BookingHistoryItem; dimmed: boolean }) {
  const poster = resolvePoster(b.movie.posterUrl)
  const status = STATUS_LABEL[b.status] ?? { text: b.status, className: 'bg-gray-100 text-gray-600 border-gray-300' }

  return (
    <Link
      to={`/bookings/${b.bookingCode}`}
      className={`flex gap-4 pay-card border border-gray-300 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-400 transition ${
        dimmed ? 'opacity-70' : ''
      }`}
    >
      <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {poster && <img src={poster} alt={b.movie.title} className="w-full h-full object-cover" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base truncate">{b.movie.title}</h3>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.className}`}>
            {status.text}
          </span>
        </div>

        <p className="text-xs pay-text-secondary flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {b.cinema.name}
          {b.cinema.branch ? ` • ${b.cinema.branch}` : ''} · {b.cinema.room}
        </p>
        <p className="text-xs pay-text-secondary flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatShowDate(b.showtime.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {b.showtime.startTime}
          </span>
        </p>
        <p className="text-xs pay-text-secondary flex items-center gap-1.5">
          <Armchair className="w-3.5 h-3.5" />
          {b.seatLabels.length ? `Seats ${b.seatLabels.join(', ')}` : 'Tickets not issued'}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono pay-text-secondary">{b.bookingCode}</span>
          <span className="text-sm font-bold">{vnd(b.amounts.total)}</span>
        </div>
      </div>
    </Link>
  )
}
