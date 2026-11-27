import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Film,
  Printer,
  Loader2,
  LifeBuoy,
  User2,
  Receipt,
} from 'lucide-react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import {
  getBookingDetail,
  formatShowDate,
  isPastShow,
  STATUS_LABEL,
  type BookingDetail as Detail,
  type TicketInfo,
} from '../api/bookings'
import { resolvePoster } from '../utils/poster'
import { vnd } from '../utils/currency'

export default function BookingDetail() {
  const { code = '' } = useParams()
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)
    getBookingDetail(code)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load your tickets'))
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <div className="min-h-screen bg-white flex flex-col pay-font-primary pay-text-primary">
      <div className="w-full border-b border-gray-100 print:hidden">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link to="/bookings" className="flex items-center gap-1.5 text-xs font-semibold pay-text-secondary hover:opacity-70">
            <ArrowLeft className="w-4 h-4" /> Booking history
          </Link>
          {data && (
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-semibold border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          )}
        </div>

        {!data && !error && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}
        {error && (
          <div className="pay-card border border-gray-300 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm text-rose-600">{error}</p>
            <p className="text-xs pay-text-secondary">Tickets can only be viewed on the browser used to book them.</p>
          </div>
        )}

        {data && <TicketView data={data} />}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}

function TicketView({ data }: { data: Detail }) {
  const poster = resolvePoster(data.movie.posterUrl)
  const status = STATUS_LABEL[data.status] ?? { text: data.status, className: 'bg-gray-100 text-gray-600 border-gray-300' }
  const past = isPastShow(data.showtime.date, data.showtime.endTime)

  return (
    <>
      {data.status === 'NEED_SUPPORT' && (
        <div className="flex gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900">
          <LifeBuoy className="w-5 h-5 shrink-0" />
          <p>
            We received your payment, but your seats were no longer on hold, so no tickets were issued. Please contact support with transaction reference{' '}
            <strong className="font-mono">{data.payment?.transactionRef}</strong> for a refund.
          </p>
        </div>
      )}

      {/* Thông tin phim + suất chiếu */}
      <section className="pay-card border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex gap-5 p-5">
          <div className="w-28 h-40 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow">
            {poster && <img src={poster} alt={data.movie.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider pay-text-secondary">Booking code</p>
                <p className="font-mono font-bold text-lg">{data.bookingCode}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.className}`}>
                {past && data.status === 'PAID' ? 'Screened' : status.text}
              </span>
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {data.movie.title}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-900 text-white">{data.movie.ageRating}</span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs pay-text-secondary">
              <Info icon={<CalendarDays className="w-3.5 h-3.5" />} text={formatShowDate(data.showtime.date)} />
              <Info icon={<Clock className="w-3.5 h-3.5" />} text={`${data.showtime.startTime} – ${data.showtime.endTime} (${data.movie.duration} min)`} />
              <Info
                icon={<MapPin className="w-3.5 h-3.5" />}
                text={`${data.cinema.name}${data.cinema.branch ? ` • ${data.cinema.branch}` : ''} · Hall ${data.cinema.room}`}
              />
              <Info icon={<Film className="w-3.5 h-3.5" />} text={data.showtime.format} />
            </div>
            <p className="text-[11px] pay-text-secondary">{data.cinema.address}</p>
          </div>
        </div>
      </section>

      {/* Từng vé, mỗi ghế 1 QR */}
      {data.tickets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider pay-text-secondary">
            Your tickets ({data.tickets.length}) · show the QR code at the entrance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.tickets.map((t) => (
              <TicketCard key={t.ticketNo} ticket={t} />
            ))}
          </div>
        </section>
      )}

      {/* Thanh toán + người nhận */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="pay-card border border-gray-300 rounded-2xl p-5 space-y-2 text-xs">
          <h3 className="flex items-center gap-2 font-bold text-sm">
            <Receipt className="w-4 h-4" /> Payment
          </h3>
          <Row label="Tickets" value={vnd(data.amounts.seats)} />
          {data.amounts.fb > 0 && <Row label="Food & drinks" value={vnd(data.amounts.fb)} />}
          {data.amounts.discount > 0 && <Row label="Discount" value={`-${vnd(data.amounts.discount)}`} highlight />}
          <div className="border-t border-gray-200 pt-2">
            <Row label="Total" value={vnd(data.amounts.total)} bold />
          </div>
          {data.payment && (
            <div className="pt-2 space-y-1 pay-text-secondary">
              <Row label="Method" value={data.payment.partner === 'SEPAY' ? 'VietQR bank transfer (SePay)' : data.payment.partner} />
              {data.payment.paidAt && <Row label="Paid at" value={data.payment.paidAt} />}
              <Row label="Transaction ref" value={data.payment.transactionRef} mono />
            </div>
          )}
        </div>

        <div className="pay-card border border-gray-300 rounded-2xl p-5 space-y-2 text-xs">
          <h3 className="flex items-center gap-2 font-bold text-sm">
            <User2 className="w-4 h-4" /> Ticket holder
          </h3>
          <Row label="Full name" value={data.customer.name} />
          <Row label="Phone" value={data.customer.phone} />
          <Row label="Email" value={data.customer.email} />
          <Row label="Booked at" value={data.createdAt} />
        </div>
      </section>
    </>
  )
}

function TicketCard({ ticket: t }: { ticket: TicketInfo }) {
  const usable = t.status === 'VALID'
  const label = STATUS_LABEL[t.status]
  return (
    <div className="relative pay-card border border-gray-300 rounded-2xl p-4 flex gap-4 items-center shadow-sm break-inside-avoid">
      <img
        src={t.qrDataUrl}
        alt={`Ticket QR ${t.ticketNo}`}
        className={`w-32 h-32 rounded-lg border border-gray-200 ${usable ? '' : 'opacity-30 grayscale'}`}
      />
      <div className="space-y-1 text-xs min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider pay-text-secondary">Seat</p>
        <p className="text-3xl font-black leading-none">{t.seatLabel}</p>
        <p className="pay-text-secondary">{t.seatType} · {vnd(t.price)}</p>
        <p className="font-mono text-[10px] pay-text-secondary truncate">{t.ticketNo}</p>
        <p className="font-mono text-[10px] pay-text-secondary">{t.barcode} · {t.gate}</p>
        {!usable && label && (
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${label.className}`}>
            {label.text}
          </span>
        )}
      </div>
    </div>
  )
}

function Info({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-1.5 min-w-0">
      {icon}
      <span className="truncate">{text}</span>
    </p>
  )
}

function Row({ label, value, bold, highlight, mono }: { label: string; value: string; bold?: boolean; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="pay-text-secondary">{label}</span>
      <span className={`${bold ? 'font-bold text-sm' : ''} ${highlight ? 'text-emerald-700' : ''} ${mono ? 'font-mono' : ''} text-right`}>
        {value}
      </span>
    </div>
  )
}
